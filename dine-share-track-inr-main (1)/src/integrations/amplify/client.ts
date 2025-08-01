import { Amplify } from 'aws-amplify';
import { AMPLIFY_CONFIG } from './config';

/**
 * Configure AWS Amplify with the application settings
 * This should be called before any Amplify services are used
 */
export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: AMPLIFY_CONFIG.USER_POOL_ID,
        userPoolClientId: AMPLIFY_CONFIG.USER_POOL_CLIENT_ID,
        identityPoolId: AMPLIFY_CONFIG.IDENTITY_POOL_ID,
        loginWith: {
          username: true,
          email: true,
        }
      }
    }
  });
}; 