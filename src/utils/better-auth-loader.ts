let betterAuthModule: any = null;

export async function loadBetterAuth() {
  if (!betterAuthModule) {
    betterAuthModule = await import('better-auth');
  }
  return betterAuthModule;
}

export async function loadBetterAuthNode() {
  const module = await import('better-auth/node');
  return module;
}
