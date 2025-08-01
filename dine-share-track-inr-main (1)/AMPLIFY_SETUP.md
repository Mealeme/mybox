# AWS Amplify Authentication Setup Guide

This project has been configured to use AWS Amplify Gen2 for authentication. This guide will help you complete the setup.

## What's Already Done

1. We've created the necessary Amplify configuration files in the `amplify/` directory
2. We've set up the authentication resource in `amplify/auth/resource.ts`
3. We've updated the React app to use the Amplify Authenticator component
4. We've added all required dependencies to `package.json`

## Steps to Complete Setup

### 1. Install Required Dependencies

First, make sure you have all the necessary dependencies:

```bash
npm install
```

### 2. Install the Amplify CLI

```bash
npm install -g @aws-amplify/backend-cli
```

### 3. Deploy to Your Sandbox Environment

This will create a personal development environment in AWS that doesn't affect others:

```bash
# Navigate to the project root
cd amplify
npx ampx sandbox
```

This will:
- Create a Cognito User Pool in your AWS account
- Generate an `amplify_outputs.json` file with your configuration

### 4. Update the Configuration (if needed)

If the automatic configuration doesn't work, you may need to update:

1. Modify `src/main.tsx` to import the outputs file:
```tsx
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
```

### 5. Start Your Dev Server

```bash
npm run dev
```

## Testing Authentication

Once the app is running, you should be able to:

1. Sign up for a new account
2. Verify your email (Cognito will send a verification code)
3. Sign in with your credentials
4. Access protected routes in the application

## Customizing Authentication

You can customize the authentication flow by:

1. Modifying `amplify/auth/resource.ts` to change authentication options
2. Customizing the Authenticator component in `src/App.tsx`
3. Re-deploying with `npx ampx sandbox`

## Switching to Production

For production deployments:

1. Create a proper Amplify environment: `npx ampx deploy`
2. Follow the prompts to choose your environment name
3. Update your configuration to use the production outputs

## Getting Help

For more information, refer to:
- [Amplify Gen2 Documentation](https://docs.amplify.aws/gen2/)
- [Amplify UI Components Documentation](https://ui.docs.amplify.aws/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/) 