// Try Google Maps for MaisConsultores #RealEstateCascais
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const proxyEnv = process.env.https_proxy || process.env.HTTPS_PROXY || '';
  let proxyServer, proxyUser, proxyPass;

  if (proxyEnv) {
    const m = proxyEnv.match(/http:\/\/([^:]+):([^@]+)@(.+)/);
    if (m) {
      proxyUser = m[1];
      proxyPass = m[2];
      proxyServer = `http://${m[3]}`;
      console.log(`Using proxy: ${proxyServer}`);
    }
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

  // Try Google Maps search for the agency
  const urls = [
    'https://maps.google.com/maps/search/MaisConsultores+RealEstateCascais+Cascais',
    'https://www.google.com/search?q=MaisConsultores+RealEstateCascais+consultor+telefone+cascais',
  ];

  for (const url of urls) {
    console.log(`\n=== Trying: ${url} ===`);
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      console.log(`Status: ${response ? response.status() : 'none'}`);
      await sleep(3000);
      const html = await page.content();
      console.log(`Content length: ${html.length}`);
      // Look for phone patterns
      const phones = html.match(/(?:\+351|00351)?[\s.-]?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g) || [];
      console.log(`Phone patterns found: ${[...new Set(phones)].join(', ')}`);
      console.log('--- First 2000 chars ---');
      console.log(html.substring(0, 2000));
    } catch(e) {
      console.log(`Error: ${e.message}`);
    }
  }

  await browser.close();
})();
