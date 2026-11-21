// Renders the pricing section before (baseline commit) and after this change, side by side, and compares
// external requests. Usage: node capture.cjs [baseline-commit]
// Pages are served as https://tracelayer.com/ from local files; every other request is recorded and aborted.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../../..');
const [baseline='af01319']=process.argv.slice(2);
const before=execFileSync('git',['show',baseline+':index.html'],{cwd:root});
const after=fs.readFileSync(path.join(root,'index.html'));
const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4'};
// Desktop shots are the 1440×900 viewport at the section; phone shots are the whole section at 390 wide,
// so every stacked card shows in one image.
const shots=[
  {name:'desktop-monthly',viewport:[1440,900],label:'Desktop, Monthly',anchor:'.tl-pricing-eyebrow',offset:100},
  {name:'desktop-yearly',viewport:[1440,900],label:'Desktop, Yearly',anchor:'.tl-pricing-eyebrow',offset:100,yearly:true},
  {name:'desktop-compare',viewport:[1440,900],label:'Desktop, Compare plans opened',anchor:'.tl-compare-toggle',offset:100,compare:true},
  {name:'phone-monthly',viewport:[390,844],label:'Phone, Monthly',section:true},
  {name:'phone-yearly',viewport:[390,844],label:'Phone, Yearly',section:true,yearly:true},
  {name:'phone-compare',viewport:[390,844],label:'Phone, Compare plans opened',anchor:'.tl-compare-toggle',offset:80,compare:true},
  {name:'phone-compare-right',viewport:[390,844],label:'Phone, Compare plans scrolled to Team',anchor:'.tl-compare-toggle',offset:80,compare:true,tableRight:true},
];

async function site(browser,viewport,html){
  const mobile=viewport[0]<=760;
  const context=await browser.newContext({viewport:{width:viewport[0],height:viewport[1]},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  const external=new Set();
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.hostname!=='tracelayer.com'||url.pathname==='/signup'||url.pathname==='/login'){external.add(url.origin+url.pathname);return route.abort();}
    if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
    const file=path.join(root,decodeURIComponent(url.pathname));
    if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
    return route.fulfill({contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // ?tracelayer_test keeps analytics from loading even though the host matches production.
  await page.goto('https://tracelayer.com/?tracelayer_test');await page.evaluate(()=>document.fonts.ready);
  return {context,page,errors,external};
}

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  const checks={baseline,shots:[],requests:{}};
  for(const s of shots){
    const files={};
    for(const [when,html] of [['before',before],['after',after]]){
      const {context,page,errors}=await site(browser,s.viewport,html);
      if(s.yearly)await page.locator('[data-set-billing="yearly"]').click();
      if(s.compare)await page.locator('.tl-compare-toggle').click();
      // On phones the table scrolls inside its own box; this shows the Team and Enterprise columns.
      if(s.tableRight)await page.locator('.tl-compare-wrap').evaluate(el=>{el.scrollLeft=el.scrollWidth;});
      files[when]=path.join(__dirname,`${when}-${s.name}.png`);
      if(s.section){await page.locator('#pricing').scrollIntoViewIfNeeded();await page.waitForTimeout(300);await page.locator('#pricing').screenshot({path:files[when]});}
      else{
        await page.evaluate(([a,o])=>{const el=document.querySelector(a);window.scrollTo(0,el.getBoundingClientRect().top+scrollY-o);},[s.anchor,s.offset]);
        await page.waitForTimeout(300);await page.screenshot({path:files[when]});
      }
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      assert.equal(overflow,false);assert.deepEqual(errors,[]);
      checks.shots.push({shot:s.name,when,viewport:s.viewport.join('x'),horizontalScroll:overflow,pageErrors:errors.length});
      await context.close();
    }

    // Side by side: before on the left, after on the right.
    const size=f=>{const b=fs.readFileSync(f);return [b.readUInt32BE(16),b.readUInt32BE(20)];};
    const [w,h]=size(files.after),[,hb]=size(files.before),pad=16,head=34;
    const pair=await browser.newContext({viewport:{width:w*2+pad*3,height:Math.max(h,hb)+head+pad}});
    const pg=await pair.newPage();
    const img=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
    await pg.setContent(`<body style="margin:0;background:#e9e7ef;font:600 14px/20px system-ui,sans-serif;color:#222">
      <div style="display:flex;align-items:flex-start;gap:${pad}px;padding:0 ${pad}px ${pad}px">
      <figure style="margin:0"><figcaption style="height:${head}px;line-height:${head}px">Before · ${s.label}</figcaption><img src="${img(files.before)}" width="${w}" style="display:block"></figure>
      <figure style="margin:0"><figcaption style="height:${head}px;line-height:${head}px">After · ${s.label}</figcaption><img src="${img(files.after)}" width="${w}" style="display:block"></figure>
      </div></body>`);
    await pg.screenshot({path:path.join(__dirname,`side-by-side-${s.name}.png`),fullPage:true});await pair.close();
  }

  // External requests while loading and scrolling the whole page, before and after this change.
  for(const [name,html] of [['before',before],['after',after]]){
    const {context,page,external}=await site(browser,[1440,900],html);
    for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=600){await page.evaluate(v=>scrollTo(0,v),y);await page.waitForTimeout(60);}
    await page.waitForTimeout(500);checks.requests[name]=[...external].sort();await context.close();
  }
  checks.requests.newExternal=checks.requests.after.filter(u=>!checks.requests.before.includes(u));
  assert.deepEqual(checks.requests.newExternal,[]);
  fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(checks,null,2)+'\n');
  await browser.close();
  console.log(JSON.stringify(checks,null,2));
})();
