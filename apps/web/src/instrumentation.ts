export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const [{ getCommerceEnvironment }, { assertRuntimePreflight }] =
    await Promise.all([
      import('./lib/config/product-visibility'),
      import('./lib/config/runtime-preflight'),
    ]);
  const environment = getCommerceEnvironment();
  if (environment !== 'local') assertRuntimePreflight(environment);
}
