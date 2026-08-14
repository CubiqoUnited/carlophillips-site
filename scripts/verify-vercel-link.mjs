import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const policy = JSON.parse(fs.readFileSync(path.join(root, 'config/production-authorities.json'), 'utf8'));
const linkPath = path.join(root, '.vercel/project.json');
const requireLink = process.argv.includes('--require-link');

if (!fs.existsSync(linkPath)) {
  if (requireLink) {
    console.error('Vercel guard: .vercel/project.json is absent. Link only after the expected account/project is verified read-only.');
    process.exit(1);
  }
  console.log('Vercel guard: no local link found; no project identity asserted.');
  process.exit(0);
}

const link = JSON.parse(fs.readFileSync(linkPath, 'utf8'));
const expected = policy.vercel;
const problems = [];

if (link.projectName && link.projectName !== expected.expectedProjectName) {
  problems.push(`projectName is ${link.projectName}, expected ${expected.expectedProjectName}`);
}
if (expected.projectId && link.projectId !== expected.projectId) {
  problems.push('projectId does not match the verified authority registry');
}
if (expected.orgId && link.orgId !== expected.orgId) {
  problems.push('orgId does not match the verified authority registry');
}
if (!expected.projectId || !expected.orgId) {
  problems.push('verified projectId/orgId are not recorded; account-level read-only verification is still required');
}

if (problems.length) {
  console.error(`Vercel guard blocked:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

console.log(`Vercel guard passed for ${expected.expectedScopeSlug}/${expected.expectedProjectName}.`);
