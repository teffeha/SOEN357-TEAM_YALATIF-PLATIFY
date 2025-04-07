# Platify - AI-Driven Recipe Search App

Platify is a mobile application that helps users find recipes based on ingredients they have, reducing food waste and saving time in the kitchen.

## Features

- **AI-Powered Recipe Generation**: Utilizes OpenAI's GPT-4 Turbo to generate personalized recipes based on your available ingredients
- **Ingredient Selection**: Search and select ingredients from a predefined list
- **Customizable Filters**: Set portions, meal planning days, dietary restrictions, and skill level
- **Recipe Cards**: View detailed recipe steps in an accordion-style interface
- **Favorites**: Save your favorite recipes for quick access
- **Dashboard Metrics**: Track time saved and food waste avoided

## Tech Stack

- **Frontend**: React Native + Expo Go (iOS/Android compatibility)
- **State Management**: Redux Toolkit
- **Backend**: Firebase (Authentication, Firestore)
- **AI Integration**: OpenAI API (GPT-4 Turbo)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Styling**: NativeBase
- **Validation**: Zod (for OpenAI JSON response parsing)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/platify.git
cd platify
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password) and Firestore
   - Update the Firebase configuration in `src/services/firebase.js`

4. Configure OpenAI API
   - Get an API key from [OpenAI](https://platform.openai.com/)
   - Update the API key in `src/services/openai.js`

5. Start the development server
```bash
npm start
```

6. Open the app in Expo Go on your device or emulator

## Project Structure

```
platify/
├── src/
│   ├── assets/         # Images, fonts, and other static assets
│   ├── components/     # Reusable UI components
│   ├── constants/      # App constants and configuration
│   ├── hooks/          # Custom React hooks
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # App screens
│   │   ├── auth/       # Authentication screens
│   │   └── main/       # Main app screens
│   ├── services/       # API services (Firebase, OpenAI)
│   ├── store/          # Redux store configuration
│   │   └── slices/     # Redux slices
│   └── utils/          # Utility functions
└── App.js              # Entry point
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for providing the AI capabilities
- [Firebase](https://firebase.google.com/) for backend services
- [Expo](https://expo.dev/) for the development framework
- [NativeBase](https://nativebase.io/) for UI components
