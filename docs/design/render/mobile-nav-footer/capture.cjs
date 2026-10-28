// Run against the local static server: node docs/design/render/mobile-nav-footer/capture.cjs
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.WEBSITE_URL||'http://127.0.0.1:8000';

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  const evidence=[];
  try {
    for(const viewport of [{width:320,height:740},{width:390,height:844},{width:600,height:800},{width:760,height:360},{width:768,height:1024},{width:1440,height:1000}]) {
      const page=await browser.newPage({viewport,reducedMotion:'reduce',isMobile:viewport.width<=760,hasTouch:viewport.width<=760});
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
      await page.goto(base);await page.evaluate(()=>document.fonts.ready);
      const save=name=>page.screenshot({path:path.join(__dirname,`${name}-${viewport.width}.png`)});
      if([320,390,768,1440].includes(viewport.width))await save('home');
      if(viewport.width<=760) {
        await page.locator('.tl-menu-toggle').click();
        await save('menu');
        await page.keyboard.press('Escape');
        await page.locator('.tl-menu-toggle').evaluate(el=>el.blur());
      }
      await page.locator('#footer').evaluate(el=>{document.documentElement.style.scrollBehavior='auto';el.scrollIntoView();});
      await page.locator('.ares-landscape img').evaluate(img=>img.decode());
      // Allow the fixed header's existing glass transition to settle.
      await page.waitForTimeout(450);
      await save('footer');
      evidence.push({viewport,header:await page.locator('#tl-header-bar').boundingBox(),footer:await page.locator('#footer').boundingBox(),horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors});
      await page.close();
    }
    fs.writeFileSync(path.join(__dirname,'layout-check.json'),JSON.stringify(evidence,null,2)+'\n');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
