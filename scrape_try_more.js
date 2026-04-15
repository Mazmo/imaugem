// Try international property portals and other sources
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const proxyEnv = process.env.https_proxy || process.env.HTTPS_PROXY || '';
  let proxyServer, proxyUser, proxyPass;
  if (proxyEnv) {
    const m = proxyEnv.match(/http:\/\/([^:]+):([^@]+)@(.+)/);
    if (m) { proxyUser = m[1]; proxyPass = m[2]; proxyServer = `http://${m[3]}`; }
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors'],
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    proxy: proxyServer ? { server: proxyServer, username: proxyUser, password: proxyPass } : undefined,
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'pt-PT',
  });

  const page = await context.newPage();

  // Test various sites to see which ones are accessible through the proxy
  const urls = [
    'https://www.properstar.com/real-estate-agent/georgina-silva',
    'https://www.properstar.com/agency/maisconsultores-realestatecascais',
    'https://www.properstar.pt/agencias/maisconsultores',
    'https://www.kyero.com/pt/estate_agents/search?q=maisconsultores',
    'https://www.green-acres.pt/en/agencias/maisconsultores',
    'https://www.thinkspain.com/agent/MaisConsultores',
    'https://www.rightmove.co.uk/overseas-property/in-Portugal/find.html?locationIdentifier=OVERSEAS%5E5946',
    'https://en.wikivoyage.org/wiki/Cascais',
  ];

  for (const url of urls) {
    console.log(`\n=== ${url} ===`);
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = response ? response.status() : 'none';
      const html = await page.content();
      console.log(`Status: ${status}, Length: ${html.length}`);
      if (status !== 403 || html.length > 200) {
        const phones = html.match(/(?:\+351|00351)?[\s.-]?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g) || [];
        console.log(`Phones: ${[...new Set(phones)].join(', ') || 'none'}`);
        const agents = html.match(/João Vicente|Henriqueta Paredes|Veronica Iacob|Georgina Antigo|Bruno Ferreira|Georgina Silva|Miguel Bicho/g) || [];
        console.log(`Agents: ${[...new Set(agents)].join(', ') || 'none'}`);
        console.log(html.substring(0, 300));
      } else {
        console.log(html.substring(0, 172));
      }
    } catch(e) {
      console.log(`Error: ${e.message.substring(0, 100)}`);
    }
  }

  await browser.close();
})();
