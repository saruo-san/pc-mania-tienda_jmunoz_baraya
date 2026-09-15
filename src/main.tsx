import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import './index.css';
import App from './App.tsx';
import { config, isConfigOk } from './config';

if (isConfigOk) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId!,
        userPoolClientId: config.userPoolClientId!,
        loginWith: {
          oauth: {
            domain: config.domain!,
            scopes: ['openid', 'email', 'profile', 'pcmania-api/read'],
            redirectSignIn: [config.redirectSignIn!],
            redirectSignOut: [config.redirectSignOut!],
            responseType: 'code',
          },
        },
      },
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
