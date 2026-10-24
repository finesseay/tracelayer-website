const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.ORBIT_PREVIEW_URL || 'http://localhost:8000/animation-variants/orbit-focus.html';
const output = __dirname;

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const errors = [];
  const measurements = [];
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('requestfailed', request => errors.push(`${request.url()} ${request.failure()?.errorText}`));

  for (const width of [1440, 1280, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.waitForTimeout(900);
    assert.equal(await page.locator('.tool').count(), 8);
    assert.equal(await page.locator('.old-stack .hub').count(), 0);
    assert.equal(await page.locator('.new-stack .hub').count(), 1);
    assert.equal(await page.locator('.invitation .avatar').count(), 4);
    assert.match(await page.locator('.brief').textContent(), /Let’s get the best team on it/);
    assert.equal(await page.locator('.brief + .invitation').count(), 1, 'invitation immediately follows Elon');
    const layout = await page.evaluate(() => {
      const visual = document.querySelector('#visual').getBoundingClientRect();
      const tools = [...document.querySelectorAll('.tool')].map(node => node.getBoundingClientRect());
      return {
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        imagesLoaded: [...document.images].every(img => img.complete && img.naturalWidth > 0),
        toolsInBounds: tools.every(box => box.left >= visual.left - 1 && box.right <= visual.right + 1 && box.top >= visual.top - 1 && box.bottom <= visual.bottom + 1),
        toolsOverlap: tools.some((a, i) => tools.slice(i + 1).some(b => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top))
      };
    });
    assert.equal(layout.overflow, false, `overflow at ${width}`);
    assert.equal(layout.imagesLoaded, true);
    assert.equal(layout.toolsInBounds, true);
    assert.equal(layout.toolsOverlap, false, `tool overlap at ${width}: ${JSON.stringify(layout)}`);
    measurements.push(layout);
    await page.screenshot({ path: path.join(output, `${width}.png`), fullPage: true });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  const slack = page.getByRole('button', { name: 'Slack', exact: true });
  const teams = page.getByRole('button', { name: 'Teams', exact: true });
  await page.locator('#visual').scrollIntoViewIfNeeded();
  let before = await slack.getAttribute('style');
  await page.waitForTimeout(350);
  assert.notEqual(await slack.getAttribute('style'), before, 'orbit moves automatically');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  before = await slack.getAttribute('style');
  await page.waitForTimeout(350);
  assert.equal(await slack.getAttribute('style'), before, 'pause stops orbit');
  for (const selector of ['.hub-block', '.orbit-spark ellipse', '.brand-connection i']) {
    assert.equal(await page.locator(selector).evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
  }
  await slack.focus(); await page.keyboard.press('Enter');
  assert.equal(await slack.getAttribute('aria-pressed'), 'true');
  await teams.focus(); await page.keyboard.press('Enter');
  assert.notEqual(await slack.getAttribute('style'), before, 'keyboard swap changes position');
  assert.match(await page.locator('#orbit-announcement').textContent(), /swapped places/);
  await slack.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Escape');
  assert.equal(await slack.getAttribute('aria-pressed'), 'false');
  const beforeDrag = await slack.getAttribute('style');
  const box = await slack.boundingBox();
  await page.mouse.move(box.x + 28, box.y + 26);
  await page.mouse.down(); await page.mouse.move(box.x + 55, box.y + 75, { steps: 8 }); await page.mouse.up();
  assert.notEqual(await slack.getAttribute('style'), beforeDrag, 'pointer drag moves tool');
  assert.equal(await slack.getAttribute('aria-pressed'), 'false', 'drag does not select');
  const dragged = await slack.getAttribute('style');
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.waitForTimeout(350);
  assert.equal(await slack.getAttribute('style'), dragged, 'custom arrangement persists');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Reset orbit arrangement', exact: true }).click();
  assert.notEqual(await slack.getAttribute('style'), dragged);
  for (let step = 0; step < 4; step++) {
    await page.locator(`[data-step="${step}"]`).click();
    assert.equal(await page.locator(`[data-step="${step}"]`).getAttribute('aria-current'), 'true');
    assert.equal(await page.locator('#conversation .avatar').count(), 1);
  }
  assert.equal(await page.locator('#status').textContent(), 'Review');
  await page.waitForTimeout(6700);
  assert.equal(await page.locator('#status').textContent(), 'Review', 'paused story stays still');
  await page.getByRole('button', { name: 'Replay animation', exact: true }).click();
  assert.equal(await page.locator('#status').textContent(), 'Brief received');
  await page.waitForTimeout(6700);
  assert.equal(await page.locator('#status').textContent(), 'Designing', 'story progresses');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  assert.equal(await page.locator('#pause').textContent(), 'Play');
  before = await slack.getAttribute('style');
  await page.waitForTimeout(350);
  assert.equal(await slack.getAttribute('style'), before, 'reduced motion keeps orbit still');
  for (const selector of ['.hub-block', '.orbit-spark ellipse', '.brand-connection i', '.float-card']) {
    assert.equal(await page.locator(selector).evaluate(el => getComputedStyle(el).animationName), 'none');
  }
  await page.getByRole('button', { name: 'Replay animation', exact: true }).click();
  assert.equal(await page.locator('#pause').textContent(), 'Play', 'replay respects reduced motion');
  assert.deepEqual(errors, []);
  const evidence = { status: 'passed', checkedAt: new Date().toISOString(), base, measurements, checks: ['local assets', 'logo on new stack only', 'Elon brief and team invitation', 'no overflow or overlapping orbit tools', 'automatic orbit', 'pause all motion', 'keyboard swap and Escape', 'pointer drag and persistence', 'reset', 'four story stages', 'pause and replay', 'automatic story progression', 'reduced motion including replay', 'no browser errors'] };
  fs.writeFileSync(path.join(output, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log('PASS:', evidence.checks.join(', '));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
