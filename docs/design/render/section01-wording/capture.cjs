// Renders section 01 before (baseline commit) and after (working tree) at desktop and phone widths,
// and checks that the page text outside section 01 is unchanged. Usage: node capture.cjs [baseline-commit]
// Pages are served as https://tracelayer.com/ from local files; every other request is aborted.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../../..');
const [baseline='af01319']=process.argv.slice(2);
const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4'};
const viewports={desktop:[1440,900],phone:[390,844]};

async function site(browser,viewport,index){
  const mobile=viewport[0]<=760;
  const context=await browser.newContext({viewport:{width:viewport[0],height:viewport[1]},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.hostname!=='tracelayer.com')return route.abort();
    if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:index});
    const file=path.join(root,decodeURIComponent(url.pathname));
    if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
    return route.fulfill({contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // ?tracelayer_test keeps analytics from loading even though the host matches production.
  await page.goto('https://tracelayer.com/?tracelayer_test');await page.evaluate(()=>document.fonts.ready);
  return {context,page,errors};
}

// Visible text of the whole page, including open shadow roots.
const pageText=page=>page.evaluate(()=>{
  const out=[];
  const walk=node=>{
    if(node.nodeType===3){const t=node.textContent.trim();if(t)out.push(t);return;}
    if(node.nodeType!==1&&node.nodeType!==11)return;
    if(node.nodeType===1&&['SCRIPT','STYLE','TEMPLATE'].includes(node.tagName))return;
    if(node.shadowRoot)walk(node.shadowRoot);
    for(const c of node.childNodes)walk(c);
  };
  walk(document.body);return out;
});

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
  const versions={before:execFileSync('git',['show',`${baseline}:index.html`],{cwd:root}),after:fs.readFileSync(path.join(root,'index.html'))};
  const texts={};const results=[];
  for(const [name,index] of Object.entries(versions)){
    for(const [label,viewport] of Object.entries(viewports)){
      const {context,page,errors}=await site(browser,viewport,index);
      texts[`${name}-${label}`]=await pageText(page);
      const heading=page.locator('#team-benefits').locator('#context-title');
      await heading.evaluate(el=>el.closest('section').scrollIntoView({block:'start'}));
      await page.waitForTimeout(800);
      const copy=await heading.evaluate(el=>({heading:el.innerText,paragraph:el.parentElement.querySelector('p').innerText,kicker:el.parentElement.querySelector('.kicker').innerText}));
      await page.screenshot({path:path.join(__dirname,`${name}-${label}.png`)});
      results.push({version:name,viewport:label,...copy,errors});
      await context.close();
    }
  }
  await browser.close();
  const after=results.filter(r=>r.version==='after');
  for(const r of after){
    assert.equal(r.heading.replace(/\s+/g,' '),'Give agents your company context.');
    assert.equal(r.paragraph,'Keep company decisions and working methods in shared guidance. Agents read it before each task.');
    assert.equal(r.kicker.replace(/\s+/g,' '),'01 SHARED UNDERSTANDING');
    assert.deepEqual(r.errors,[]);
  }
  // Outside section 01, the visible text must match the baseline exactly.
  const changed=new Set(['Your company,','in every agent.','Give agents your','company context.',
    'Your culture, your decisions, the details only your team knows. Capture them in company documents and lasting guidance. Agents read it before each task, then apply it to the work.',
    'Keep company decisions and working methods in shared guidance. Agents read it before each task.']);
  for(const label of Object.keys(viewports)){
    const strip=t=>t.filter(s=>!changed.has(s));
    assert.deepEqual(strip(texts[`after-${label}`]),strip(texts[`before-${label}`]),`${label}: text outside section 01 changed`);
  }
  fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify({baseline,results,otherTextUnchanged:true},null,2)+'\n');
  console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
