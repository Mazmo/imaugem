/**
 * SEO audit fetch for imaugem.pt
 * Runs inside GitHub Actions to bypass CloudFlare / proxy blocks
 */
const { chromium } = require('playwright');
const fs = require('fs');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(ctx, url) {
  const page = await ctx.newPage();
  const result = { url, status: null, finalUrl: null, error: null, html: '', title: '', h1s: [], h2s: [], metas: {}, jsonld: [], canonical: '', hreflang: [], ogTags: {} };
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
    await sleep(1000);
    result.status = resp ? resp.status() : 0;
    result.finalUrl = page.url();
    result.html = await page.content();

    // Extract SEO data
    result.title = await page.$eval('title', el => el.textContent).catch(() => '');
    result.h1s = await page.$$eval('h1', els => els.map(e => e.textContent.trim())).catch(() => []);
    result.h2s = await page.$$eval('h2', els => els.map(e => e.textContent.trim())).catch(() => []);
    result.canonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => '');
    result.hreflang = await page.$$eval('link[rel="alternate"][hreflang]', els => els.map(e => ({ lang: e.hreflang, href: e.href }))).catch(() => []);

    // Meta tags
    const metas = await page.$$eval('meta', els => els.map(e => ({
      name: e.getAttribute('name') || e.getAttribute('property') || e.getAttribute('http-equiv') || '',
      content: e.getAttribute('content') || ''
    }))).catch(() => []);
    metas.forEach(m => { result.metas[m.name] = m.content; });

    // OG tags
    metas.filter(m => m.name.startsWith('og:')).forEach(m => { result.ogTags[m.name] = m.content; });

    // JSON-LD
    result.jsonld = await page.$$eval('script[type="application/ld+json"]', els => els.map(e => {
      try { return JSON.parse(e.textContent); } catch(ex) { return { raw: e.textContent }; }
    })).catch(() => []);

    // Internal links
    result.links = await page.$$eval('a[href]', els => [...new Set(els.map(e => e.href).filter(h => h.includes('imaugem.pt')))]).catch(() => []);

    console.log(`✓ ${url} → ${result.status} (${result.html.length} chars) title="${result.title}"`);
  } catch(e) {
    result.error = e.message.substring(0, 300);
    console.log(`✗ ${url} → ${result.error}`);
  }
  await page.close();
  return result;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    locale: 'pt-PT',
  });

  const urls = [
    'https://www.imaugem.pt/robots.txt',
    'https://www.imaugem.pt/sitemap.xml',
    'https://www.imaugem.pt/',
    'https://www.imaugem.pt/sobre',
    'https://www.imaugem.pt/quem-somos',
    'https://www.imaugem.pt/contactos',
    'https://www.imaugem.pt/servicos',
    'https://www.imaugem.pt/imoveis',
    'https://www.imaugem.pt/en',
    'https://www.imaugem.pt/blog',
    'https://imaugem.pt/',  // non-www redirect check
  ];

  const results = [];
  for (const url of urls) {
    results.push(await fetchPage(ctx, url));
  }

  await browser.close();

  // Write full audit JSON
  fs.writeFileSync('imaugem_audit_raw.json', JSON.stringify(results, null, 2));

  // Write human-readable summary
  let summary = '# IMAUGEM.PT SEO AUDIT RAW DATA\n\n';
  for (const r of results) {
    summary += `\n## ${r.url}\n`;
    summary += `- Status: ${r.status}\n`;
    summary += `- Final URL: ${r.finalUrl}\n`;
    if (r.error) summary += `- ERROR: ${r.error}\n`;
    summary += `- Title: ${r.title || '(empty)'}\n`;
    summary += `- Canonical: ${r.canonical || '(none)'}\n`;
    summary += `- Robots meta: ${r.metas['robots'] || '(none)'}\n`;
    summary += `- Description: ${r.metas['description'] || '(none)'}\n`;
    summary += `- H1s: ${r.h1s.join(' | ') || '(none)'}\n`;
    summary += `- H2s: ${r.h2s.join(' | ') || '(none)'}\n`;
    summary += `- OG title: ${r.ogTags['og:title'] || '(none)'}\n`;
    summary += `- OG description: ${r.ogTags['og:description'] || '(none)'}\n`;
    summary += `- Hreflang: ${JSON.stringify(r.hreflang)}\n`;
    summary += `- JSON-LD count: ${r.jsonld.length}\n`;
    if (r.jsonld.length) summary += `- JSON-LD: ${JSON.stringify(r.jsonld, null, 2)}\n`;
    summary += `- Internal links (${r.links?.length || 0}): ${(r.links || []).slice(0, 10).join(', ')}\n`;
    if (r.html.length > 200) {
      // extract body text approximation
      const bodyText = r.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').substring(0, 800);
      summary += `- Body text preview: ${bodyText}\n`;
    }
  }

  fs.writeFileSync('imaugem_audit_summary.txt', summary);
  console.log('\n=== AUDIT COMPLETE ===');
  console.log(summary);
})();
