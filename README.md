# Platify - Recipe Generator App

Platify is a mobile application that helps users discover recipes based on ingredients they have at hand. The app provides personalized recipe recommendations, allows users to save their favorite recipes, and offers a user-friendly interface for an enjoyable cooking experience.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Features](#features)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14.x or later)
- [npm](https://www.npmjs.com/) (v6.x or later) or [Yarn](https://yarnpkg.com/) (v1.22.x or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/client) app installed on your mobile device

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/SOEN357-TEAM_YALATIF-PLATIFY.git
   cd SOEN357-TEAM_YALATIF-PLATIFY/platify
   ```

2. **Install dependencies**

   Using npm:
   ```bash
   npm install
   ```

   Or using Yarn:
   ```bash
   yarn install
   ```

   ```javascript
   // src/config/firebaseConfig.js
   export default {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

   f. Replace the placeholder values with your Firebase configuration values


## Running the App

Once you've completed the installation steps, you can run the app:

1. **Start the development server**

   ```bash
   npx expo start
   ```

   This will start the Expo development server and display a QR code in your terminal.

2. **Run on a physical device**

   a. Install the Expo Go app on your iOS or Android device
   
   b. Scan the QR code with your device:
      - iOS: Use the Camera app to scan the QR code
      - Android: Use the Expo Go app to scan the QR code
   
   c. The app will load on your device

## Features

- **User Authentication**: Sign up, sign in, and sign out functionality
- **Recipe Search**: Find recipes based on ingredients you have
- **Favorites**: Save and manage your favorite recipes
- **Recipe Details**: View detailed instructions for each recipe
- **Profile Management**: Manage your user profile and settings

## Project Structure

```
platify/
├── App.js                 # Main application entry point
├── app.json               # Expo configuration
├── assets/                # Static assets (images, fonts)
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration files
│   ├── data/              # Sample data and constants
│   ├── navigation/        # Navigation setup
│   ├── screens/           # App screens
│   │   ├── auth/          # Authentication screens
│   │   └── main/          # Main app screens
│   ├── services/          # API and service functions
│   ├── store/             # Redux store setup
│   │   └── slices/        # Redux slices
│   └── utils/             # Utility functions
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```

## Troubleshooting

### Common Issues

1. **Expo server not starting**
   
   Try clearing the cache:
   ```bash
   npx expo start -c
   ```

2. **Dependencies installation issues**
   
   Try removing node_modules and reinstalling:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Firebase connection issues**
   
   - Verify your Firebase configuration in `src/config/firebaseConfig.js`
   - Make sure your Firebase project has the appropriate services enabled
   - Check that your device has internet connectivity

4. **Expo Go app not connecting**
   
   - Ensure your mobile device is on the same network as your development machine
   - Try using the "Tunnel" connection option in Expo by running:
     ```bash
     npx expo start --tunnel
     ```

---

Happy cooking with Platify! 🍳👨‍🍳👩‍🍳
