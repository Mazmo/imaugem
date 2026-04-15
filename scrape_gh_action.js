/**
 * Scrape MaisConsultores #RealEstateCascais agent phones.
 * Designed to run inside GitHub Actions where the site is accessible.
 */
const { chromium } = require('playwright');
const fs = require('fs');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function clickAndRevealPhone(page, agentUrl) {
  try {
    await page.goto(agentUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    // Try clicking a "Ver telefone" / "Show phone" button
    const phoneSelectors = [
      'button:has-text("Ver telefone")',
      'button:has-text("Telefone")',
      'a:has-text("Ver telefone")',
      '[data-action="show-phone"]',
      '.phone-reveal',
      '.show-phone',
      'button.phone',
      '[class*="phone"] button',
      '[class*="contact"] button',
    ];

    for (const sel of phoneSelectors) {
      try {
        const btn = await page.$(sel);
        if (btn) {
          await btn.click();
          await sleep(1500);
          break;
        }
      } catch (_) {}
    }

    // Extract phone from page after potential reveal
    const html = await page.content();

    // Look for Portuguese phone patterns
    const phonePatterns = [
      // +351 followed by 9-digit number
      /\+351\s*9\d{2}\s*\d{3}\s*\d{3}/g,
      // 00351 followed by 9-digit number
      /00351\s*9\d{2}\s*\d{3}\s*\d{3}/g,
      // Raw 9-digit mobile
      /\b9[1236]\d\s*\d{3}\s*\d{3}\b/g,
    ];

    const found = new Set();
    for (const pat of phonePatterns) {
      const matches = html.match(pat) || [];
      matches.forEach(m => found.add(m.replace(/\s/g, '')));
    }

    // Also check text content of elements that might have the phone
    const phoneTexts = await page.$$eval(
      '[class*="phone"], [class*="tel"], [class*="contact"], [href^="tel:"]',
      els => els.map(el => el.textContent.trim() + '|' + (el.getAttribute('href') || ''))
    ).catch(() => []);

    phoneTexts.forEach(t => {
      const m = t.match(/(?:\+351|00351)?9[1236]\d[\s.-]?\d{3}[\s.-]?\d{3}/);
      if (m) found.add(m[0].replace(/[\s.-]/g, ''));
    });

    return [...found];
  } catch (e) {
    console.error(`Error scraping ${agentUrl}: ${e.message}`);
    return [];
  }
}

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'pt-PT',
  });

  const page = await context.newPage();

  // Step 1: Load the agency page and discover all agents
  console.log('Loading agency page...');
  let agentLinks = [];

  try {
    const res = await page.goto('https://www.maisconsultores.pt/agencias/realestatecascais', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    console.log(`Agency page status: ${res ? res.status() : 'unknown'}`);
    await sleep(3000);

    const html = await page.content();
    console.log(`Agency page length: ${html.length}`);
    fs.writeFileSync('agency_page.html', html);

    // Extract agent profile URLs
    agentLinks = await page.$$eval(
      'a[href*="/consultor-imobiliario/"], a[href*="/consultant/"]',
      links => [...new Set(links.map(l => l.href))]
    ).catch(() => []);

    console.log(`Found ${agentLinks.length} agent links: ${agentLinks.join(', ')}`);

    // Also try to find phone numbers directly on the agency page
    const pagePhones = html.match(/(?:\+351|00351)?9[1236]\d[\s.-]?\d{3}[\s.-]?\d{3}/g) || [];
    console.log(`Phones on agency page: ${[...new Set(pagePhones)].join(', ') || 'none'}`);

  } catch (e) {
    console.error(`Failed to load agency page: ${e.message}`);
    // Fallback: use known agent URLs
    agentLinks = [
      'https://www.maisconsultores.pt/consultor-imobiliario/joao-vicente',
      'https://www.maisconsultores.pt/consultor-imobiliario/georgina-silva',
      'https://www.maisconsultores.pt/consultor-imobiliario/georgina-old',
      'https://www.maisconsultores.pt/consultor-imobiliario/bruno-ferreira',
      'https://www.maisconsultores.pt/consultor-imobiliario/veronica-iacob',
      'https://www.maisconsultores.pt/consultor-imobiliario/miguel-bicho',
    ];
  }

  // Also try the known agent subdomains
  const subdomainUrls = [
    'https://miguelbicho.maisconsultores.pt/',
    'https://bferreira.maisconsultores.pt/',
    'https://ginasilva.maisconsultores.pt/',
  ];

  // Step 2: For each agent, click reveal and extract phone
  const results = [];

  const allUrls = [...new Set([...agentLinks, ...subdomainUrls])];
  for (const url of allUrls) {
    console.log(`\nScraping: ${url}`);
    const phones = await clickAndRevealPhone(page, url);
    console.log(`  Phones found: ${phones.join(', ') || 'none'}`);

    const name = url.match(/consultor-imobiliario\/([^/?]+)/)?.[1]
      || url.match(/https:\/\/([^.]+)\.maisconsultores/)?.[1]
      || url;

    results.push({ url, slug: name, phones });
  }

  await browser.close();

  // Save results
  fs.writeFileSync('cascais_phones.json', JSON.stringify(results, null, 2));
  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
})();
