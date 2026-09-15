export const config = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined,
  userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined,
  domain: import.meta.env.VITE_COGNITO_DOMAIN as string | undefined,
  redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN as string | undefined,
  redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT as string | undefined,
  apiUrl: import.meta.env.VITE_API_URL as string | undefined,
};

export function configFaltante(): string[] {
  return Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export const isConfigOk = configFaltante().length === 0;
