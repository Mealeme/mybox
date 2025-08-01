# AWS Amplify Gen2 Authentication

```
  _____                    ___                      _ _  __
 / ____|                  / _ \                    | (_)/ _|
| |     ___   __ _ _ __ | (_) |                   | | | |_ _   _
| |    / _ \ / _` | '_ \ > _ <                    | | |  _| | | |
| |___| (_) | (_| | | | | (_) |    ______    _    | | | | | |_| |
 \_____\___/ \__, |_| |_|\___/    |______|  (_)   |_|_|_|  \__, |
              __/ |                                          __/ |
             |___/                                          |___/
```

This project uses AWS Amplify Gen2 for authentication.

## AWS Credentials Setup

Before running Amplify commands, you need to set up your AWS credentials:

1. Create an AWS credentials file:
   - On Windows: `C:\Users\<YOUR_USERNAME>\.aws\credentials`
   - On macOS/Linux: `~/.aws/credentials`

2. Add the following to the credentials file:
   ```
   [default]
   aws_access_key_id = AKIAQYEI465OQ7JKRYVN
   aws_secret_access_key = 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
   region = ap-south-1
   ```

3. Save the file and close it.

## Getting Started

### Windows Setup

```bash
# Run the initialization script
.\amplify\scripts\init.bat
```

### Linux/macOS Setup

```bash
# Make the script executable
chmod +x ./amplify/scripts/init.sh

# Run the initialization script
./amplify/scripts/init.sh
```

## What's Included

- AWS Cognito User Pool setup for authentication
- Email and username authentication
- Authenticator React component
- Secure login, sign up, and account recovery flows

## Manual Setup Steps

1. Install required dependencies:
```bash
npm install @aws-amplify/ui-react aws-amplify
```

2. Deploy to your sandbox environment:
```bash
npx ampx sandbox
```

This will create your AWS resources and generate an `amplify_outputs.json` file.

## Connecting to the Frontend

In your main file (e.g., `src/main.tsx`), configure Amplify:

```tsx
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
```

## Using the Authenticator Component

You can use the Authenticator component in your app:

```tsx
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>Hello {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
          {/* Your app content */}
        </div>
      )}
    </Authenticator>
  );
}
```

## Learn More

For more information, visit the [Amplify Gen2 Documentation](https://docs.amplify.aws/gen2/) 