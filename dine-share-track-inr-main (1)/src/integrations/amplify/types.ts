// AWS Amplify types for authentication
export type AmplifyUserAttributes = {
  email?: string;
  phone_number?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  [key: string]: string | undefined;
};

export type AmplifyUser = {
  username: string;
  userId: string;
  signInDetails?: {
    loginId?: string;
  };
  getSignInUserSession?: () => {
    getAccessToken: () => {
      getJwtToken: () => string;
    };
  };
};

export interface AmplifySignUpParams {
  username: string;
  password: string;
  options?: {
    userAttributes?: Record<string, string>;
    autoSignIn?: boolean;
  };
}

export interface AmplifySignInParams {
  username: string;
  password: string;
}

export interface AmplifyError extends Error {
  code?: string;
  name: string;
  message: string;
} 