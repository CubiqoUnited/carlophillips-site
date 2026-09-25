const { VERCEL_PROJECT_ID, VERCEL_TOKEN } = process.env;

for (const [name, value] of Object.entries({
  VERCEL_PROJECT_ID,
  VERCEL_TOKEN,
})) {
  if (!value?.trim()) throw new Error(`${name}_REQUIRED`);
}

let response;
try {
  response = await fetch(
    `https://api.vercel.com/v9/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}`,
    {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      signal: AbortSignal.timeout(15_000),
    }
  );
} catch {
  throw new Error('VERCEL_PROJECT_REQUEST_FAILED');
}

if (!response.ok) {
  const label = response.status === 401 ? 'AUTH' : 'ACCESS';
  throw new Error(`VERCEL_PROJECT_${label}_FAILED_${response.status}`);
}

let project;
try {
  project = await response.json();
} catch {
  throw new Error('VERCEL_PROJECT_RESPONSE_INVALID');
}

if (!project || typeof project !== 'object' || Array.isArray(project)) {
  throw new Error('VERCEL_PROJECT_RESPONSE_INVALID');
}

if (project.id !== VERCEL_PROJECT_ID) {
  throw new Error('VERCEL_PROJECT_ID_MISMATCH');
}

console.log('Vercel CI credential can access the exact configured project.');
