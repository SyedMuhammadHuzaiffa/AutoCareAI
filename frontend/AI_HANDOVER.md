# AutoCareAI - UI HANDOVER FOR CURSOR

## Goal
Complete the entire frontend UI layer without changing backend logic.

---

## Tech Stack
- Expo Router (file-based navigation)
- React Native
- Axios API layer already configured
- AuthContext already implemented
- Backend already working (DO NOT MODIFY)

---

## Existing Working APIs
- GET /cars → fetch all cars
- POST /cars → add car (brand, model/year)
- DELETE /cars/:id → delete car (if exists, use it)
- GET /cars/:id → car detail (if exists)

---

## CURRENT PAGES
- Home (car list)
- Add Car
- Car Detail (basic)

---

## REQUIRED UI IMPROVEMENTS

### 1. HOME SCREEN
- Modern garage UI
- Animated cards (smooth entry)
- Car logo support from local assets mapping
- Swipe LEFT → delete car (confirm modal)
- Pull to refresh
- Empty state UI improved

---

### 2. CAR CARD
- Show:
  - Brand logo (local assets only)
  - Car name
  - Model year
- Smooth press animation
- Navigate to /car/[id]

---

### 3. CAR DETAIL SCREEN
- Clean dashboard UI:
  - Car header with logo
  - Service history timeline UI (mock if API missing)
  - AI Diagnosis button (call backend endpoint if available)
  - Delete button (danger action)
- Add loading states

---

### 4. ANIMATIONS
- Use react-native-reanimated
- Card fade + slide in on load
- Swipe gesture delete

---

### 5. RULES (VERY IMPORTANT)
- DO NOT change backend APIs
- DO NOT break navigation structure
- ONLY improve UI + frontend logic
- Keep Expo Router structure intact
- Reuse existing API file

---

## FINAL OUTPUT EXPECTED
- Fully polished UI
- Working swipe delete
- Working navigation
- Clean car detail page
- No broken screens