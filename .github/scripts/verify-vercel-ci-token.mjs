const { VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN } = process.env;

for (const [name, value] of Object.entries({
  VERCEL_ORG_ID,
  VERCEL_PROJECT_ID,
  VERCEL_TOKEN,
})) {
  if (!value) throw new Error(`${name}_REQUIRED`);
}

async function requireAccess(label, url) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`${label}_FAILED_${response.status}`);
  }
}

await requireAccess('VERCEL_USER_AUTH', 'https://api.vercel.com/v2/user');
await requireAccess(
  'VERCEL_PROJECT_ACCESS',
  `https://api.vercel.com/v9/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}?teamId=${encodeURIComponent(VERCEL_ORG_ID)}`
);

console.log(
  'Vercel CI credential is valid for the configured team and project.'
);
