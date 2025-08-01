#!/bin/bash

# Initialize Amplify Gen2 project
echo "Initializing Amplify Gen2 project..."

# Install necessary dependencies
echo "Installing Amplify dependencies..."
npm install @aws-amplify/ui-react aws-amplify

# Install Amplify Gen2 CLI if not already installed
if ! command -v ampx &> /dev/null; then
  echo "Installing Amplify Gen2 CLI globally..."
  npm install -g @aws-amplify/backend-cli
fi

# Initialize the sandbox if not already done
echo "Creating Amplify sandbox environment..."
cd "$(dirname "$0")/.."
npx ampx sandbox

echo "Setup complete! Your Amplify Auth is ready to use."
echo "Make sure to update your React application to use the Authenticator component." 