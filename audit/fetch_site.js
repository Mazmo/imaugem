/**
 * Full SEO audit fetch for imaugem.pt
 * Runs through proxy with SSL inspection (--ignore-certificate-errors)
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const OUT = '/home/user/imaugem/audit/raw';
fs.mkdirSync(OUT, { recursive: true });

async function fetchPage(page, url, slug) {
  const result = { url, slug, status: null, error: null, html: '', headers: {} };
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(1500);
    result.status = resp ? resp.status() : 0;
    result.headers = resp ? await resp.allHeaders() : {};
    result.html = await page.content();
    fs.writeFileSync(path.join(OUT, `${slug}.html`), result.html);
    console.log(`✓ ${url} → ${result.status} (${result.html.length} chars)`);
  } catch(e) {
    result.error = e.message.substring(0, 200);
    console.log(`✗ ${url} → ${result.error}`);
  }
  return result;
}

(async () => {
  const proxyEnv = process.env.https_proxy || process.env.HTTPS_PROXY || '';
  let proxy;
  if (proxyEnv) {
    const m = proxyEnv.match(/http:\/\/([^:]+):([^@]+)@(.+)/);
    if (m) proxy = { server: `http://${m[3]}`, username: m[1], password: m[2] };
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--ignore-certificate-errors'],
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    proxy,
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'pt-PT',
  });
  const page = await context.newPage();

  const urls = [
    ['https://www.imaugem.pt/robots.txt',  'robots'],
    ['https://www.imaugem.pt/sitemap.xml',  'sitemap'],
    ['https://www.imaugem.pt/',             'home'],
    ['https://www.imaugem.pt/sobre',        'sobre'],
    ['https://www.imaugem.pt/quem-somos',   'quem-somos'],
    ['https://www.imaugem.pt/about',        'about'],
    ['https://www.imaugem.pt/contactos',    'contactos'],
    ['https://www.imaugem.pt/contact',      'contact'],
    ['https://www.imaugem.pt/servicos',     'servicos'],
    ['https://www.imaugem.pt/imoveis',      'imoveis'],
    ['https://www.imaugem.pt/properties',   'properties'],
    ['https://www.imaugem.pt/en',           'en-home'],
    ['https://www.imaugem.pt/blog',         'blog'],
    ['https://www.imaugem.pt/404-test-page-nonexistent', '404test'],
  ];

  const results = [];
  for (const [url, slug] of urls) {
    const r = await fetchPage(page, url, slug);
    results.push(r);
  }

  await browser.close();

  // Save summary JSON
  const summary = results.map(r => ({
    url: r.url, slug: r.slug, status: r.status, error: r.error,
    htmlLen: r.html.length,
    contentType: r.headers['content-type'] || '',
  }));
  fs.writeFileSync(path.join(OUT, '_summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nDone. Files saved to', OUT);
})();
