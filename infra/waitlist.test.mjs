import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { once } from 'node:events'
import { resolve } from 'node:path'

const preview = 'https://preview-785bbe1afdedafc265db7c.tracelayer.com'

test('waitlist permits the saved preview only on public POST /waitlist', async t => {
  const dir = await mkdtemp(resolve('.waitlist-test-'))
  const child = spawn(process.execPath, ['infra/waitlist.mjs'], {
    env: { ...process.env, WAITLIST_PORT: '0', WAITLIST_DATA_DIR: dir },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  t.after(async () => {
    const stopped = once(child, 'exit')
    child.kill()
    await stopped
    await rm(dir, { recursive: true, force: true })
  })
  const port = await new Promise((resolvePort, reject) => {
    let output = ''
    const timeout = setTimeout(() => reject(new Error('Service did not start')), 5000)
    child.stdout.on('data', data => {
      output += data
      const match = output.match(/listening on (\d+)/)
      if (match) { clearTimeout(timeout); resolvePort(match[1]) }
    })
    child.once('error', error => { clearTimeout(timeout); reject(error) })
  })
  const base = `http://127.0.0.1:${port}`
  async function preflight(origin, path = '/waitlist', method = 'POST') {
    return fetch(base + path, { method: 'OPTIONS', headers: {
      Origin: origin, 'Access-Control-Request-Method': method,
      'Access-Control-Request-Headers': 'content-type',
    } })
  }
  for (const origin of [preview, 'https://tracelayer.com', 'https://www.tracelayer.com']) {
    const response = await preflight(origin)
    assert.equal(response.status, 204)
    assert.equal(response.headers.get('access-control-allow-origin'), origin)
    assert.match(response.headers.get('vary'), /Origin/)
    assert.equal(response.headers.get('access-control-allow-credentials'), null)
  }
  for (const origin of ['null', 'https://preview-other.tracelayer.com', preview + '.evil.example', 'http://preview-785bbe1afdedafc265db7c.tracelayer.com']) {
    assert.equal((await preflight(origin)).headers.get('access-control-allow-origin'), null)
  }
  for (const path of ['/health', '/api/v1/tasks', '/waitlist/', '/waitlist?other=1']) {
    assert.equal((await preflight(preview, path)).headers.get('access-control-allow-origin'), null)
  }
  assert.equal((await preflight(preview, '/waitlist', 'GET')).headers.get('access-control-allow-origin'), null)
  assert.equal((await fetch(base + '/health', { headers: { Origin: preview } })).headers.get('access-control-allow-origin'), null)
  async function join(email) {
    return fetch(base + '/waitlist', { method: 'POST', headers: {
      Origin: preview, 'Content-Type': 'application/json',
    }, body: JSON.stringify({ email, ref: null }) })
  }
  const invalid = await join('invalid')
  assert.equal(invalid.status, 400)
  assert.equal(invalid.headers.get('access-control-allow-origin'), preview)
  const joined = await join('preview-test@example.invalid')
  assert.equal(joined.status, 200)
  assert.equal(joined.headers.get('access-control-allow-origin'), preview)
  const result = await joined.json()
  assert.equal(typeof result.number, 'number')
  assert.equal(result.number, 1)
  assert.deepEqual(await (await join('preview-test@example.invalid')).json(), result)
  // Verify real persistence in an isolated local directory, never production data.
  await new Promise(resolve => setTimeout(resolve, 250))
  const db = JSON.parse(await readFile(resolve(dir, 'waitlist.json'), 'utf8'))
  assert.equal(db.seq, 1)
  assert.equal(db.rows['preview-test@example.invalid'].n, result.number)
  assert.equal((await (await fetch(base + '/health')).json()).ok, true)
})
