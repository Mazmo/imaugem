// Try LinkedIn agent profiles for phone numbers
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
    // LinkedIn company page - lists all employees
    'https://pt.linkedin.com/company/mcrealestatecascais/people',
    'https://pt.linkedin.com/company/mcrealestatecascais',
    // Miguel Bicho confirmed profile (should work if LinkedIn is accessible)
    'https://pt.linkedin.com/in/miguel-bicho-92478521',
  ];

  for (const url of urls) {
    console.log(`\n=== ${url} ===`);
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const status = response ? response.status() : 'none';
      const html = await page.content();
      console.log(`Status: ${status}, Length: ${html.length}`);
      if (html.length > 200) {
        const phones = html.match(/(?:\+351|00351)?[\s.-]?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g) || [];
        console.log(`Phones: ${[...new Set(phones)].join(', ') || 'none'}`);
        console.log(html.substring(0, 500));
      } else {
        console.log(html);
      }
    } catch(e) {
      console.log(`Error: ${e.message.substring(0, 100)}`);
    }
  }

  await browser.close();
})();
