// Static release checks with real Chromium. No production submissions or analytics.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '../..');
const types = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.pdf':'application/pdf','.txt':'text/plain'};

test('selected source assets and preserved archives', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname,'source-manifest.json')));
  for (const item of manifest.files) {
    if (item.path.endsWith('.html')) continue;
    const data = fs.readFileSync(path.join(root,item.path));
    assert.equal(crypto.createHash('sha256').update(data).digest('hex'), item.sha256, item.path);
  }
  const homepage = fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert(!homepage.includes('name="robots" content="noindex'));
  assert(!homepage.includes('/cdn-cgi/'));
  assert(homepage.includes('href="mailto:hello@tracelayer.com"'));
  assert.equal((homepage.match(/src="\/assets\/analytics.js"/g)||[]).length,1);
  assert(!homepage.includes('waitlist/demo.js'));
  for (const [archive,original] of [['archive1','index.html'],['archive2','v2/index.html']]) {
    const archived = fs.readFileSync(path.join(root,archive,'index.html'),'utf8');
    const expected = require('node:child_process').execFileSync('git',['show',manifest.archiveSourceCommit+':'+original],{cwd:root,encoding:'utf8'})
      .replace('<head>','<head>\n<meta name="robots" content="noindex,follow">')
      .replace(/(<link rel="canonical" href=")[^"]+/g,'$1https://tracelayer.com/'+archive+'/');
    assert.equal(archived,archive==='archive2'?expected.replaceAll('href="/v2/"','href="/archive2/"'):expected);
  }
});

test('homepage, archives, navigation, newsletter and native video in Chromium', async t => {
  const server = http.createServer((req,res) => {
    const url=new URL(req.url,'http://localhost');
    let filename=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if (!filename.startsWith(root+path.sep) && filename!==root) {res.writeHead(403).end();return;}
    if (fs.existsSync(filename)&&fs.statSync(filename).isDirectory()) {
      if (!url.pathname.endsWith('/')) {res.writeHead(301,{Location:url.pathname+'/'+url.search}).end();return;}
      filename=path.join(filename,'index.html');
    }
    if (!fs.existsSync(filename)||!fs.statSync(filename).isFile()) {res.writeHead(404).end();return;}
    const size=fs.statSync(filename).size, headers={'Content-Type':types[path.extname(filename)]||'application/octet-stream','Accept-Ranges':'bytes'};
    let start=0,end=size-1,status=200;
    const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
    if(range){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
    res.writeHead(status,{...headers,'Content-Length':end-start+1});fs.createReadStream(filename,{start,end}).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  t.after(()=>browser.close());
  for(const viewport of [{width:1440,height:1000},{width:768,height:1024},{width:390,height:844}]) {
    await t.test(`layout and interactions at ${viewport.width}px`,async()=>{
      const context=await browser.newContext({viewport,reducedMotion:'reduce'});
      t.after(()=>context.close());context.setDefaultTimeout(10000);
      let submissions=0;
      await context.route('**/*',route=>{
        const u=new URL(route.request().url());
        if(u.origin===base)return route.continue();
        if(u.href==='https://api.tracelayer.com/waitlist'){
          submissions++;
          assert.equal(route.request().method(),'POST');
          assert.equal(route.request().postDataJSON().email,'website-test@example.invalid');
          return route.fulfill({contentType:'application/json',body:JSON.stringify({number:13,ahead:12,ref:'test-invite'})});
        }
        if(u.hostname==='tracelayer.com'&&['/login','/signup'].includes(u.pathname))return route.fulfill({contentType:'text/html',body:'<h1>Isolated auth destination</h1>'});
        return route.abort();
      });
      const page=await context.newPage();const errors=[],missing=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)missing.push(r.url());});
      await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);
      assert.match((await page.locator('h1').innerText()).replace(/\s+/g,' '),/Imagine if you could effortlessly integrate AI agents into your team/);
      assert.equal(await page.locator('#tl2Dock').isVisible(),false);
      for(const target of ['login','signup']){
        const link=page.locator(`#tl-header-bar a[href="https://tracelayer.com/${target}"]`).first();
        const popupPromise=context.waitForEvent('page');await link.click();const popup=await popupPromise;
        await popup.waitForURL(`https://tracelayer.com/${target}`);await popup.close();
      }
      await page.locator('#demo').scrollIntoViewIfNeeded();
      const video=page.locator('video');assert.equal(await video.count(),1);
      await video.evaluate(v=>{v.muted=true;v.load();});
      await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
      const duration=await video.evaluate(v=>v.duration);assert(duration>130&&duration<133);
      await video.evaluate(v=>v.play());await page.waitForFunction(()=>document.querySelector('video').currentTime>.1);
      await video.evaluate(v=>{v.currentTime=65;});await page.waitForFunction(()=>{const v=document.querySelector('video');return !v.seeking&&v.currentTime>=65;});
      await video.evaluate(v=>v.pause());
      await page.locator('.newsletter-trigger').click();assert.equal(await page.locator('#tl2Dock').getAttribute('data-state'),'idle');
      await page.locator('#dockJoin').click();await page.locator('#dockEmail').fill('invalid');await page.locator('#dockSend').click();
      assert.equal(submissions,0);assert.equal(await page.locator('#dockEmail').getAttribute('aria-invalid'),'true');
      await page.locator('#dockEmail').fill('website-test@example.invalid');await page.locator('#dockSend').click();
      await page.waitForFunction(()=>document.querySelector('#tl2Dock').dataset.state==='done');assert.equal(submissions,1);
      await page.keyboard.press('Escape');assert.equal(await page.locator('#tl2Dock').isVisible(),false);
      for(const href of ['legal/index.html','legal/privacy.html','https://www.linkedin.com/company/143889446/','https://x.com/tracelayer'])assert(await page.locator(`footer a[href$="${href}"]`).count());
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      assert.deepEqual(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);
      for(const route of ['/archive1','/archive2']){
        await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
        assert.equal(new URL(page.url()).pathname,route+'/');
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        assert(await page.locator('h1').innerText());
      }
      await page.goto(base+'/v2/?invite=example#models');await page.waitForURL('**/archive2/?invite=example#models');
      assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
      await context.close();
    });
  }
  const range=await fetch(base+'/assets/tracelayer-explainer-subtitled.mp4',{headers:{Range:'bytes=0-1023'}});
  assert.equal(range.status,206);assert.equal(range.headers.get('content-range'),'bytes 0-1023/44461507');
  for(const asset of ['/legal/downloads/terms.pdf','/legal/downloads/privacy.pdf','/legal/downloads/terms.txt','/legal/downloads/privacy.txt'])assert.equal((await fetch(base+asset)).status,200);
});
