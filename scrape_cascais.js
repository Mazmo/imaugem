const { chromium } = require('/opt/node22/lib/node_modules/playwright');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function scrapeAgencyPage(browser, url) {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  });

  try {
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Take a screenshot for debugging
    await page.screenshot({ path: '/tmp/cascais_page.png', fullPage: false });

    // Get full page HTML
    const html = await page.content();
    console.log(`HTML length: ${html.length}`);
    console.log('--- First 3000 chars ---');
    console.log(html.substring(0, 3000));

    return html;
  } catch (e) {
    console.error(`Error: ${e.message}`);
    return null;
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });

  try {
    await scrapeAgencyPage(browser, 'https://www.maisconsultores.pt/agencias/realestatecascais');
  } finally {
    await browser.close();
  }
})();
