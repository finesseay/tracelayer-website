// Run after: npm install --no-save playwright; python3 -m http.server 8000
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const zlib = require('node:zlib');
const pages = require('node:child_process').execFileSync('git',['ls-files','*.html'],{encoding:'utf8'}).trim().split('\n').sort((a,b)=>Number(a.startsWith('download/'))-Number(b.startsWith('download/')));
(async () => {
 const browser = await chromium.launch({ executablePath:'/usr/bin/chromium', args:['--no-sandbox'] });
 const context = await browser.newContext({ userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
 // Exercise real visitor behavior: PostHog deliberately filters automation.
 await context.addInitScript(() => Object.defineProperty(navigator,'webdriver',{get:()=>false}));
 const records = [];
 const requests = new Map();
 const page = await context.newPage();
 await page.route('**/download/tracelayer.apk?*', route => route.fulfill({status:200,contentType:'text/html',body:'Download destination reached'}));
 page.on('request', req => {
  if (!/eu\.i\.posthog\.com\/(e|i\/v0\/e)\//.test(req.url())) return;
  let body = req.postDataBuffer();
  if (body[0] === 0x1f && body[1] === 0x8b) body = zlib.gunzipSync(body);
  const raw = body.toString();
  let event;
  try { event = JSON.parse(raw); } catch { event = JSON.parse(Buffer.from(new URLSearchParams(raw).get('data'),'base64').toString()); }
  event = event.batch ? event.batch[0] : Array.isArray(event) ? event[0] : event;
  const record = {endpoint:req.url(),event}; records.push(record); requests.set(req,record);
 });
 page.on('response', response => { const record = requests.get(response.request()); if(record) record.status=response.status(); });
 let id;
 for (const path of pages) {
  const start = records.length;
  await page.goto('http://localhost:8000/'+path+'?token=SECRET_QUERY#SECRET_FRAGMENT');
  await page.waitForTimeout(2200);
  assert.equal(records.length-start,1,`one pageview: ${path}`);
  const record=records.at(-1), event=record.event, props=event.properties;
  assert.equal(event.event,'$pageview');
  assert.equal(props.tracelayer_surface,'website');
  assert.equal(props.tracelayer_test,true);
  assert.equal(props.$current_url,'http://localhost:8000/'+path);
  assert(!JSON.stringify(event).includes('SECRET'));
  assert(!props.$set && !props.$set_once && !event.$set && !event.$set_once);
  if (!path.startsWith('download/')) assert.equal(record.status,200);
  id ??= props.distinct_id; assert.equal(props.distinct_id,id);
  if(path.startsWith('download/')) assert(page.url().startsWith('https://app.tracelayer.com/download/tracelayer.apk'));
  console.log('PASS',path,record.status);
 }
 await page.goto('http://localhost:8000/'); await page.waitForTimeout(1000);
 await page.reload(); await page.waitForTimeout(1000);
 assert.equal(records.at(-1).event.properties.distinct_id,id);
 const count=records.length;
 await page.addScriptTag({url:'/assets/analytics.js'}); await page.waitForTimeout(400);
 assert.equal(records.length,count,'duplicate include does not capture twice');
 await page.evaluate(()=>posthog.capture('form_submitted',{email:'SECRET_EMAIL'}));
 await page.waitForTimeout(400); assert.equal(records.length,count,'non-pageview event discarded');
 // Blocked SDK: page and download continue without analytics.
 await page.route('https://eu-assets.i.posthog.com/**', r=>r.abort());
 await page.goto('http://localhost:8000/download/android/index.html');
 await page.waitForTimeout(2200); assert(page.url().includes('/download/tracelayer.apk'));
 assert.equal(records.length,count);
 fs.writeFileSync('docs/analytics/browser-evidence.json',JSON.stringify({checkedAt:new Date().toISOString(),checks:['all ten pages','anonymous ID across pages and reload','no query/hash/form data','duplicate initialization','blocked SDK download fallback'],records},null,2)+'\n');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
