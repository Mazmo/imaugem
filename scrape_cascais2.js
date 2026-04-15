const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const https = require('https');
const http = require('http');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  // Get proxy settings from environment
  const proxyEnv = process.env.https_proxy || process.env.HTTPS_PROXY || '';
  let proxyServer = undefined;
  let proxyUser = undefined;
  let proxyPass = undefined;

  if (proxyEnv) {
    const m = proxyEnv.match(/http:\/\/([^:]+):([^@]+)@(.+)/);
    if (m) {
      proxyUser = m[1];
      proxyPass = m[2];
      proxyServer = `http://${m[3]}`;
      console.log(`Using proxy: ${proxyServer}`);
      console.log(`Proxy user: ${proxyUser.substring(0, 20)}...`);
    }
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    proxy: proxyServer ? {
      server: proxyServer,
      username: proxyUser,
      password: proxyPass,
    } : undefined,
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'pt-PT',
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to Mais Consultores Cascais page...');
    const response = await page.goto('https://www.maisconsultores.pt/agencias/realestatecascais', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log(`Response status: ${response ? response.status() : 'no response'}`);
    await sleep(3000);

    const title = await page.title();
    console.log(`Title: ${title}`);

    const html = await page.content();
    console.log(`Content length: ${html.length}`);
    console.log('--- First 2000 chars ---');
    console.log(html.substring(0, 2000));

  } catch(e) {
    console.error(`Navigation error: ${e.message}`);

    // Try to get any partial content
    try {
      const content = await page.content();
      console.log('Partial content:', content.substring(0, 1000));
    } catch(e2) {
      console.error('Could not get content:', e2.message);
    }
  } finally {
    await browser.close();
  }
})();
