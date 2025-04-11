# Product Requirements Document (PRD): AI-Driven Recipe Search App (MVP)

## Core Technologies
- **Frontend**: React Native + Expo Go (iOS/Android compatibility)  
- **State Management**: Redux Toolkit or Zustand  
- **Backend**: Firebase (Authentication, Firestore for user data/favorites and ingredient list)  
- **AI Integration**: OpenAI API (GPT-4 Turbo for recipe generation)  
- **Navigation**: React Navigation (Stack + Bottom Tabs)  
- **Styling**: NativeBase or Styled Components (for theme consistency)  
- **Validation**: Zod (for OpenAI JSON response parsing)  

---

## Key Features & User Flows

### 1. Authentication (Signup/Signin)
- **Fields**: First name, Last name, Email, Password (with confirmation)  
- **Validation**: Email format, password strength (8+ chars, 1 special character)  
- **Error Handling**: Duplicate email, weak password, network issues [Firebase Auth]  
- **Post-Signup**: Immediate access to main app; no email verification (MVP scope).  

---

### 2. Main Dashboard
- **Weekly Metrics**:  
  - **Time Saved**: Calculated as `(Avg. cooking time without app) - (Recipe time)` × recipes used.  
  - **Food Waste Avoided**: Based on ingredient quantities used vs. typical waste patterns.  
- **Favorited Recipes**:  
  - Grid layout with recipe name, skill level, and thumbnail.  
  - Swipe-to-delete with undo button.  

---

### 3. AI Recipe Search
#### Ingredients Selection Process:
- Ingredients will be stored in Firestore as a predefined list of valid items.  
- Users can search and select ingredients using autocomplete functionality tied to Firestore data.  
- Strict validation ensures only ingredients from the Firestore list can be selected.

#### Input Filters:
- Portions (1–10), Days (1–7 for meal planning).  
- Dietary Restrictions (vegan, gluten-free, etc.), Allergies (nuts, shellfish).  
- Skill Level (toggle: beginner/intermediate/advanced).  

#### AI Prompt Structure:

{
"ingredients": ["chicken", "rice"],
"portions": 4,
"days": 3,
"diet": "gluten-free",
"skill": "beginner",
"constants": ["water", "oil", "salt", "pepper"]
}

#### Output Requirements:
- Strict JSON with exactly 3 recipes, each containing:
  - `name`, `skill_level`, `steps` (array of strings), `time_estimate`.  
- Validation via Zod to prevent malformed responses.

---

### 4. Recipe Cards & Interaction
#### Card Design:
- Accordion-style expand for steps.  
- Skill-level badge (color-coded: green/beginner, orange/intermediate, red/advanced).  

#### Save Feature:
- Heart icon toggle (saves to Firebase under user’s collection).  
- Offline persistence via AsyncStorage (Expo).  

---

## Firestore Schema

### Ingredients Collection

{
"ingredients": [
{
"id": "1",
"name": "chicken",
"category": "protein"
},
{
"id": "2",
"name": "rice",
"category": "grain"
},
{
"id": "3",
"name": "broccoli",
"category": "vegetable"
}
]
}
- Each ingredient will have an `id`, `name`, and optional `category` for filtering purposes.

---
