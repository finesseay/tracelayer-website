const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const records=[];
for(const width of [1440,390]) for(const version of ['before','after']){
const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const missing=[];page.on('pageerror',e=>missing.push(e.message));
await page.goto(`http://localhost:8000/design-preview/${version}.html`);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
await page.screenshot({path:`design-preview/${version}-${width}.png`,fullPage:true});
records.push({version,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors:missing});await page.close();}
fs.writeFileSync('docs/design/render/product-specific-v3/checks.json',JSON.stringify(records,null,2));await browser.close();})();
