// Test maisconsultores.pt with ignore-cert-errors + individual agent pages + API endpoints
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

  const urls = [
    'https://www.maisconsultores.pt/agencias/realestatecascais',
    'https://www.maisconsultores.pt/consultor-imobiliario/joao-vicente',
    'https://www.maisconsultores.pt/consultor-imobiliario/bruno-ferreira',
    'https://maisconsultores.pt/api/consultants?agency=realestatecascais',
    'https://maisconsultores.pt/api/agencies/realestatecascais',
  ];

  for (const url of urls) {
    console.log(`\n=== ${url} ===`);
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const status = response ? response.status() : 'none';
      const html = await page.content();
      console.log(`Status: ${status}, Length: ${html.length}`);
      console.log(html.substring(0, 500));
    } catch(e) {
      console.log(`Error: ${e.message.substring(0, 120)}`);
    }
  }

  await browser.close();
})();
