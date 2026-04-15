// Try bypassing proxy entirely for maisconsultores.pt
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--proxy-bypass-list=*',
      '--no-proxy-server',
    ],
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    console.log('Trying direct connection (no proxy)...');
    const response = await page.goto('https://www.maisconsultores.pt/agencias/realestatecascais', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    console.log(`Status: ${response ? response.status() : 'none'}`);
    const html = await page.content();
    console.log(`Length: ${html.length}`);
    console.log(html.substring(0, 1000));
  } catch(e) {
    console.log(`Direct connection failed: ${e.message}`);
  } finally {
    await browser.close();
  }
})();
