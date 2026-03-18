const https = require('https');
const jwt = require('jsonwebtoken');

const CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts = null;
let cachedAtMs = 0;
const CERTS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`http_${res.statusCode}`));
          }
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('invalid_json'));
          }
        });
      })
      .on('error', reject);
  });
}

async function getCerts() {
  const now = Date.now();
  if (cachedCerts && now - cachedAtMs < CERTS_CACHE_TTL_MS) return cachedCerts;
  const certs = await fetchJson(CERTS_URL);
  cachedCerts = certs;
  cachedAtMs = now;
  return certs;
}

async function verifyFirebaseIdToken(idToken, { projectId }) {
  if (!idToken) {
    const err = new Error('missing_token');
    err.code = 'missing_token';
    throw err;
  }
  if (!projectId) {
    const err = new Error('missing_project_id');
    err.code = 'missing_project_id';
    throw err;
  }

  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded?.header?.kid) {
    const err = new Error('invalid_token');
    err.code = 'invalid_token';
    throw err;
  }

  const certs = await getCerts();
  const cert = certs[decoded.header.kid];
  if (!cert) {
    const err = new Error('unknown_kid');
    err.code = 'unknown_kid';
    throw err;
  }

  const issuer = `https://securetoken.google.com/${projectId}`;
  try {
    return jwt.verify(idToken, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer
    });
  } catch (e) {
    const err = new Error('invalid_token');
    err.code = 'invalid_token';
    err.detail = e?.message;
    throw err;
  }
}

module.exports = { verifyFirebaseIdToken };

