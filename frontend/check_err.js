const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  // We need to login first or we might just get redirected.
  // Actually, if there is a syntax/reference error on module load, it will show up even before login.
  await page.goto('http://localhost:5173/projects/6a576158b06f399f21567bd4', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
