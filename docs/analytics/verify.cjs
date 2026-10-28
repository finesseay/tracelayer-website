// node --test docs/analytics/verify.cjs
// Uses the real SDK and Chromium, but intercepts every collector request locally.
const { chromium } = require('playwright');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const sdkUrl = 'https://eu-assets.i.posthog.com/static/array.js';
const token = 'phc_mqJFJHdmmkM5Bi9CBJkPSuB2DRiceBqFXxE7hLwixThQ';

function decode(request) {
  let body = request.postDataBuffer();
  if (body[0] === 0x1f && body[1] === 0x8b) body = zlib.gunzipSync(body);
  let value;
  try { value = JSON.parse(body.toString()); }
  catch { value = JSON.parse(Buffer.from(new URLSearchParams(body.toString()).get('data'), 'base64').toString()); }
  return value.batch || (Array.isArray(value) ? value : [value]);
}

test('website analytics browser contract', async t => {
  const sdk = process.env.POSTHOG_SDK_PATH ? fs.readFileSync(process.env.POSTHOG_SDK_PATH) :
    Buffer.from(await (await fetch(sdkUrl)).arrayBuffer());
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox','--disable-blink-features=AutomationControlled']});
  t.after(() => browser.close());
  const summary = [];
  async function fixture(init, options = {}) {
    const context = await browser.newContext({userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'});
    // The isolated browser represents a normal visitor; all ingestion is intercepted.
    // Production code retains the SDK's automation filter.
    if (init) await context.addInitScript(init);
    const events = [], requests = [];
    context.on('request', request => {
      const url = new URL(request.url());
      if (url.hostname === 'eu.i.posthog.com' && /\/(e|i\/v0\/e)\//.test(url.pathname)) events.push(...decode(request));
    });
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      requests.push(request.url());
      if (url.href === sdkUrl) {
        if (options.blockSdk) return route.abort();
        if (options.slowSdk) await new Promise(resolve => setTimeout(resolve, 2500));
        return route.fulfill({body:sdk,contentType:'application/javascript'}).catch(() => {});
      }
      if (url.hostname === 'eu.i.posthog.com') {
        return route.fulfill({json:{status:1}});
      }
      if (url.hostname === 'app.tracelayer.com') return route.fulfill({body:'Download destination reached',contentType:'text/html'});
      if (['tracelayer.com','www.tracelayer.com','localhost','preview-123.tracelayer.com'].includes(url.hostname)) {
        let filename = path.join(root, decodeURIComponent(url.pathname));
        if (url.pathname.endsWith('/')) filename = path.join(filename, 'index.html');
        if (!filename.startsWith(root + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) return route.fulfill({status:404,body:'Not found'});
        const ext = path.extname(filename);
        return route.fulfill({body:fs.readFileSync(filename),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'})[ext] || 'application/octet-stream'});
      }
      // Tests never call live account, waitlist or ingestion services.
      return route.abort();
    });
    const page = await context.newPage();
    async function settle() { await page.waitForTimeout(150); }
    async function view(url = 'https://tracelayer.com/') {
      await page.goto(url);
      await page.waitForFunction(() => window.posthog && window.posthog.__loaded);
      await settle();
    }
    async function click(href, keyboard = false) {
      await page.evaluate(href => {
        document.getElementById('analytics-test-link')?.remove();
        const a = document.createElement('a'); a.id = 'analytics-test-link'; a.href = href;
        a.innerHTML = '<span>fixture link</span>';
        a.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;background:white;color:black';
        document.body.appendChild(a);
        if (!window.__fixtureClickBlock) {
          document.addEventListener('click', event => event.preventDefault());
          document.addEventListener('auxclick', event => event.preventDefault());
          window.__fixtureClickBlock = true;
        }
      }, href);
      if (keyboard) { await page.locator('#analytics-test-link').focus(); await page.keyboard.press('Enter'); }
      else await page.locator('#analytics-test-link span').click();
      await settle();
    }
    return {context,page,events,requests,view,click,settle};
  }
  async function check(name, run) {
    if (process.env.ANALYTICS_TEST_FILTER && !new RegExp(process.env.ANALYTICS_TEST_FILTER).test(name)) return;
    await t.test(name, async () => { await run(); summary.push(name); });
  }
  await check('real SDK sends sanitized capable pageviews and keeps anonymous/session identity', async () => {
    const f = await fixture();
    try {
      await f.view('https://tracelayer.com/?token=SECRET_QUERY&utm_source=Newsletter&utm_medium=email&utm_campaign=october-launch&utm_term=SECRET_TERM#SECRET_HASH');
      const p = f.events[0].properties;
      assert.equal(f.events[0].event, '$pageview');
      assert.equal(p.$current_url, 'https://tracelayer.com/');
      assert.equal(p.tracelayer_signup_tracking, true);
      assert.equal(p.tracelayer_download_tracking, true);
      assert.equal(p.tracelayer_surface, 'website');
      assert.equal(p.utm_source, 'newsletter');
      assert.equal(p.utm_campaign, 'october-launch');
      assert.equal(p.$process_person_profile, false);
      assert(p.distinct_id && p.$session_id && p.$pageview_id);
      await f.page.reload(); await f.settle();
      const again = f.events.filter(e => e.event === '$pageview').at(-1).properties;
      assert.equal(again.distinct_id, p.distinct_id);
      assert.equal(again.$session_id, p.$session_id);
      assert.notEqual(again.$pageview_id, p.$pageview_id);
      await f.view('https://tracelayer.com/');
      await f.page.locator('.newsletter-trigger').first().click(); await f.settle();
      assert.equal(f.events.filter(e => e.event === 'website_signup_click').length, 0, 'waitlist is not signup');
      assert.equal(f.events.filter(e => e.event === '$pageview').at(-1).properties.distinct_id, p.distinct_id);
      assert(!JSON.stringify(f.events).includes('SECRET'));
      assert(f.events.some(e => e.event === '$pageleave' && e.properties.$session_id === p.$session_id), JSON.stringify(f.events.map(e=>[e.event,e.properties.$session_id])));
    } finally { await f.context.close(); }
  });
  await check('only real signup/download destinations count, including keyboard and middle clicks', async () => {
    const f = await fixture();
    try {
      await f.view();
      await f.click('https://tracelayer.com/signup?token=SECRET#SECRET', true);
      await f.click('https://tracelayer.com/signup');
      await f.click('https://www.tracelayer.com/signup/');
      await f.click('/download/android/');
      await f.click('https://app.tracelayer.com/download/tracelayer.apk?token=SECRET');
      await f.page.locator('#analytics-test-link').click({button:'middle'}); await f.settle();
      assert.equal(f.events.filter(e => e.event === 'website_signup_click').length, 3);
      assert.equal(f.events.filter(e => e.event === 'website_download').length, 3);
      const stableEvents = () => f.events.filter(e => e.event !== 'website_engaged').length;
      const count = stableEvents();
      for (const href of ['#', '/login', 'https://tracelayer.com/login', 'https://www.tracelayer.com/login/', 'https://tracelayer.com.evil.example/signup', 'mailto:user@example.com', 'https://app.tracelayer.com/signup', 'http://tracelayer.com/signup']) await f.click(href);
      await f.page.evaluate(() => document.getElementById('analytics-test-link').click());
      await f.page.evaluate(() => {
        posthog.capture('form_submitted', {email:'SECRET_EMAIL'});
        posthog.capture('$identify', {$set:{email:'SECRET_EMAIL'}});
        posthog.capture('website_waitlist_joined', {email:'SECRET_EMAIL'});
      });
      await f.settle(); assert.equal(stableEvents(), count);
      assert(!JSON.stringify(f.events).includes('SECRET'));
      await f.page.addScriptTag({url:'/assets/analytics.js'}); await f.settle();
      assert.equal(stableEvents(), count);
    } finally { await f.context.close(); }
  });
  await check('canceled clicks do not count and arbitrary property enrichment is stripped', async () => {
    const f = await fixture();
    try {
      await f.view();
      await f.page.evaluate(() => document.body.addEventListener('click', e => e.preventDefault()));
      await f.click('/signup');
      assert.equal(f.events.filter(e => e.event === 'website_signup_click').length, 0);
      await f.page.evaluate(() => posthog.capture('$pageview', {$set:{email:'SECRET'}, email:'SECRET', $current_url:'https://SECRET', $referrer:'SECRET', utm_source:'SECRET@example.com'}));
      await f.settle(); assert(!JSON.stringify(f.events).includes('SECRET'));
    } finally { await f.context.close(); }
  });
  await check('referrer is host only and sensitive campaign tags are rejected', async () => {
    const f = await fixture();
    try {
      await f.page.goto('https://www.tracelayer.com/?utm_source=name%40example.com&utm_medium=https%3A%2F%2Fsecret.example&utm_campaign=token_01234567890123456789', {referer:'https://search.example/path/SECRET?token=SECRET'});
      await f.page.waitForFunction(() => window.posthog && window.posthog.__loaded); await f.settle();
      const p = f.events[0].properties;
      assert.equal(p.$referring_domain, 'search.example');
      assert.equal(p.utm_source, undefined); assert.equal(p.utm_medium, undefined); assert.equal(p.utm_campaign, undefined);
      assert(!JSON.stringify(f.events).includes('SECRET'));
    } finally { await f.context.close(); }
  });
  await check('preview, mockup, unknown/private paths, internal and test visits load no SDK', async () => {
    const f = await fixture();
    try {
      await f.page.route('https://tracelayer.com/task/*', r => r.fulfill({body:fs.readFileSync(path.join(root,'index.html')),contentType:'text/html'}));
      for (const url of ['https://tracelayer.com/task/SECRET_PRIVATE_PATH', 'https://localhost/', 'https://preview-123.tracelayer.com/', 'https://tracelayer.com/mockup1/', 'https://tracelayer.com/archive1/', 'https://tracelayer.com/archive2/', 'https://tracelayer.com/?preview=true', 'https://tracelayer.com/?tracelayer_test=1', 'https://tracelayer.com/?tracelayer_internal=1']) {
        await f.page.goto(url); await f.settle();
      }
      assert.equal(f.events.length, 0); assert(!f.requests.includes(sdkUrl));
      await f.page.evaluate(() => localStorage.setItem('tracelayer_internal','1'));
      await f.page.goto('https://tracelayer.com/'); await f.settle();
      assert(!f.requests.includes(sdkUrl));
    } finally { await f.context.close(); }
  });
  for (const signal of ['dnt','gpc','local-optout','sdk-optout']) {
    await check(`${signal} prevents collection and downloads still redirect`, async () => {
      const f = await fixture();
      try {
        await f.context.addInitScript(({signal,token}) => {
          if (signal === 'dnt') Object.defineProperty(navigator,'doNotTrack',{get:()=>'1'});
          if (signal === 'gpc') Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>true});
          if (signal === 'local-optout') localStorage.setItem('tracelayer_analytics_opt_out','1');
          if (signal === 'sdk-optout') localStorage.setItem('__ph_opt_in_out_'+token,'0');
        }, {signal, token});
        await f.page.goto('https://tracelayer.com/'); await f.settle();
        assert.equal(f.events.length,0);
        if (signal !== 'sdk-optout') assert(!f.requests.includes(sdkUrl));
        await f.page.goto('https://tracelayer.com/download/android/');
        await f.page.waitForURL('https://app.tracelayer.com/download/tracelayer.apk?*');
        assert.equal(f.events.length,0);
      } finally { await f.context.close(); }
    });
  }
  await check('revoking privacy choice stops later clicks and pageleave', async () => {
    const f = await fixture();
    try {
      await f.view(); const count = f.events.length;
      await f.page.evaluate(() => localStorage.setItem('tracelayer_analytics_opt_out','1'));
      await f.click('/signup');
      await f.page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
      await f.settle(); assert.equal(f.events.length, count);
    } finally { await f.context.close(); }
  });
  await check('engagement measures visible time, scroll and deduplicated leave/resume', async () => {
    const f = await fixture();
    try {
      await f.view();
      await f.page.clock.install();
      await f.page.clock.fastForward(11000); await f.settle();
      // Timers were registered before the test clock was installed, so exercise elapsed
      // foreground time by hiding/resuming, which schedules the remaining engagement timer.
      await f.page.evaluate(() => {
        Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});
        document.dispatchEvent(new Event('visibilitychange'));
        window.dispatchEvent(new PageTransitionEvent('pagehide'));
      });
      await f.settle();
      assert.equal(f.events.filter(e => e.event === '$pageleave').length,1);
      const first = f.events.find(e => e.event === '$pageleave').properties;
      await f.page.clock.fastForward(120000);
      await f.page.evaluate(() => {
        Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await f.page.clock.fastForward(11000); await f.settle();
      await f.page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide'))); await f.settle();
      const last = f.events.filter(e => e.event === '$pageleave').at(-1).properties;
      assert(last.visible_seconds - first.visible_seconds <= 12, 'hidden two minutes excluded');
      assert.equal(f.events.filter(e => e.event === 'website_engaged').length,1);
      assert.equal(f.events.filter(e => e.event === '$pageview').length,1);
      await f.page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}))); await f.settle();
      assert.equal(f.events.filter(e => e.event === '$pageview').length,2);
    } finally { await f.context.close(); }
  });
  for (const options of [{},{blockSdk:true},{slowSdk:true}]) {
    await check(`automatic download redirect is not a click; SDK ${JSON.stringify(options)}`, async () => {
      const f = await fixture(undefined,options);
      try {
        await f.page.goto('https://tracelayer.com/download/android/');
        await f.page.waitForURL('https://app.tracelayer.com/download/tracelayer.apk?*');
        assert.equal(f.events.filter(e => e.event === 'website_download').length,0);
        if (!options.blockSdk && !options.slowSdk) assert.equal(f.events.filter(e => e.event === '$pageview').length,1);
      } finally { await f.context.close(); }
    });
  }
  await check('unavailable browser storage does not break page use', async () => {
    const f = await fixture(() => {
      Object.defineProperty(window,'localStorage',{get:()=>{throw new Error('Storage unavailable');}});
      Object.defineProperty(window,'sessionStorage',{get:()=>{throw new Error('Storage unavailable');}});
    });
    try { await f.view(); await f.click('/signup'); assert.equal(f.events.filter(e => e.event === 'website_signup_click').length,1); }
    finally { await f.context.close(); }
  });
  if (summary.length === 15) fs.writeFileSync(path.join(__dirname,'conversion-browser-evidence.json'), JSON.stringify({checkedAt:new Date().toISOString(),sdkSha256:require('node:crypto').createHash('sha256').update(sdk).digest('hex'),liveIngestion:false,checks:summary},null,2)+'\n');
});
