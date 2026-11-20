// Renders the pricing section beside the approved preview, and compares external requests with the
// previous homepage. Usage: node capture.cjs <pricing-journey.html> [baseline-commit]
// Pages are served as https://tracelayer.com/ from local files; every other request is recorded and aborted.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../../..');
const [journey,baseline='ff80e59']=process.argv.slice(2);
const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4'};
// Offsets line each render up with the preview, whose site frame starts below its own toolbar.
const steps=[
  {step:2,viewport:[1440,900],label:'Header with the Pricing link'},
  {step:3,viewport:[1440,900],label:'Pricing, monthly',anchor:'.tl-pricing-eyebrow',offset:175},
  {step:4,viewport:[1440,900],label:'Pricing, yearly',anchor:'.tl-pricing-eyebrow',offset:175,yearly:true},
  {step:5,viewport:[1440,900],label:'Compare plans opened',anchor:'.tl-compare-toggle',offset:154,compare:true},
  {step:6,viewport:[1440,900],label:'Questions opened',anchor:'.tl-faq-title',offset:154,faq:true},
  {step:50,viewport:[390,844],label:'Phone, 390 wide',anchor:'.tl-pricing-eyebrow',offset:289},
];

async function site(browser,viewport,index='index.html'){
  const mobile=viewport[0]<=760;
  const context=await browser.newContext({viewport:{width:viewport[0],height:viewport[1]},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  const external=new Set();
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.hostname!=='tracelayer.com'||url.pathname==='/signup'||url.pathname==='/login'){external.add(url.origin+url.pathname);return route.abort();}
    if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:index==='index.html'?fs.readFileSync(path.join(root,'index.html')):index});
    const file=path.join(root,decodeURIComponent(url.pathname));
    if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
    return route.fulfill({contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // ?tracelayer_test keeps analytics from loading even though the host matches production.
  await page.goto('https://tracelayer.com/?tracelayer_test');await page.evaluate(()=>document.fonts.ready);
  return {context,page,errors,external};
}

async function scrollTo(page,anchor,offset){
  await page.evaluate(([a,o])=>{const el=document.querySelector(a);window.scrollTo(0,el.getBoundingClientRect().top+scrollY-o);},[anchor,offset]);
  await page.waitForTimeout(300);
}

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  const checks={steps:[],requests:{}};
  for(const s of steps){
    const ours=path.join(__dirname,`site-step-${s.step}.png`),theirs=path.join(__dirname,`preview-step-${s.step}.png`);
    const preview=await browser.newContext({viewport:{width:s.viewport[0],height:s.viewport[1]}});
    const pp=await preview.newPage();await pp.goto('file://'+path.resolve(journey)+'#step='+s.step);await pp.waitForTimeout(2500);
    await pp.screenshot({path:theirs});await preview.close();

    const {context,page,errors}=await site(browser,s.viewport);
    if(s.yearly)await page.locator('[data-set-billing="yearly"]').click();
    if(s.compare)await page.locator('.tl-compare-toggle').click();
    if(s.faq)await page.getByRole('button',{name:'What counts as a Task?'}).click();
    if(s.anchor)await scrollTo(page,s.anchor,s.offset);
    await page.screenshot({path:ours});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(overflow,false);assert.deepEqual(errors,[]);
    checks.steps.push({step:s.step,viewport:s.viewport.join('x'),label:s.label,horizontalScroll:overflow,pageErrors:errors.length});
    await context.close();

    // Side by side: the approved preview on the left, the built homepage on the right.
    const [w,h]=s.viewport,pad=16,head=34;
    const pair=await browser.newContext({viewport:{width:w*2+pad*3,height:h+head+pad}});
    const pg=await pair.newPage();
    const img=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
    await pg.setContent(`<body style="margin:0;background:#e9e7ef;font:600 14px/20px system-ui,sans-serif;color:#222">
      <div style="display:flex;gap:${pad}px;padding:0 ${pad}px ${pad}px">
      <figure style="margin:0"><figcaption style="height:${head}px;line-height:${head}px">Approved preview · step ${s.step}</figcaption><img src="${img(theirs)}" width="${w}" height="${h}" style="display:block"></figure>
      <figure style="margin:0"><figcaption style="height:${head}px;line-height:${head}px">Built homepage · ${s.label}</figcaption><img src="${img(ours)}" width="${w}" height="${h}" style="display:block"></figure>
      </div></body>`);
    await pg.screenshot({path:path.join(__dirname,`side-by-side-step-${s.step}.png`)});await pair.close();
  }

  // The phone menu with the new link, opened.
  {
    const {context,page}=await site(browser,[390,844]);
    await page.locator('.tl-menu-toggle').click();await page.waitForTimeout(200);
    await page.screenshot({path:path.join(__dirname,'site-phone-menu.png')});await context.close();
  }

  // External requests while loading and scrolling the whole page, before and after this change.
  for(const [name,html] of [['before',execFileSync('git',['show',baseline+':index.html'],{cwd:root})],['after','index.html']]){
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
