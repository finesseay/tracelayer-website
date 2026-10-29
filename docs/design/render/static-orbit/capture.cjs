const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const results=[];
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390});
  await context.route('**/*',r=>new URL(r.request().url()).origin==='http://localhost:8000'?r.continue():r.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:8000');await page.evaluate(()=>document.fonts.ready);
  const logos=page.locator('#orbit-hero .tool');
  const before=await logos.evaluateAll(ns=>ns.map(n=>[n.style.left,n.style.top]));
  await page.waitForTimeout(1200);
  assert.deepEqual(await logos.evaluateAll(ns=>ns.map(n=>[n.style.left,n.style.top])),before);
  await page.locator('#orbit-hero #visual').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${__dirname}/orbit-${width}.png`});
  let scrollDelta=null;
  if(width===390){
   const box=await logos.first().boundingBox();const x=box.x+box.width/2,y=box.y+box.height/2;
   const cdp=await context.newCDPSession(page);const start=await page.evaluate(()=>scrollY);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*25}]});await page.waitForTimeout(30);}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(400);
   scrollDelta=await page.evaluate(()=>scrollY)-start;assert(scrollDelta>80,`Swipe scroll delta: ${scrollDelta}`);
  }
  for(const [index,section] of (await page.locator('#team-benefits section').all()).entries()){
   await section.scrollIntoViewIfNeeded();await section.screenshot({path:`${__dirname}/section-${index+1}-${width}.png`});
  }
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  results.push({width,logosStatic:true,scrollDelta,pageErrors:errors});await context.close();
 }
 fs.writeFileSync(`${__dirname}/checks.json`,JSON.stringify(results,null,2)+'\n');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
