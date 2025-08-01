/**
 * AWS Amplify Configuration
 */

export const AMPLIFY_CONFIG = {
  // AWS Cognito User Pool Configuration
  USER_POOL_ID: import.meta.env.VITE_AWS_USER_POOL_ID || 'ap-south-1_wEPQ8gI1A',
  USER_POOL_CLIENT_ID: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID || '7vcf5k48cm83qrmjd4t0rgv3s0',
  IDENTITY_POOL_ID: import.meta.env.VITE_AWS_IDENTITY_POOL_ID || '', // Leave empty if you don't have an identity pool
}; 