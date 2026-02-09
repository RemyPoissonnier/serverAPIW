# GEMINI.md

## Project Overview
This project is the backend API for **IAVidAnimals**, a SaaS platform dedicated to AI-powered video generation. It provides endpoints for user authentication, subscription management, and video generation workflows.

### Main Technologies
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database & Auth:** Firebase (Firestore and Firebase Admin SDK)
- **Payments & Billing:** Polar.sh and Stripe
- **Infrastructure:** Docker & Docker Compose

### Architecture
The project follows a modular structure:
- `src/server.ts`: Entry point of the application.
- `src/app.ts`: Express application setup, including middleware and routing.
- `src/routes/`: Defines the API endpoints.
- `src/controller/`: Handles incoming HTTP requests and responses.
- `src/modules/`: Contains business logic, service integrations (AI, Payment, Auth), and database interactions.
- `src/config/`: Configuration files for external services like Polar.

## Building and Running

### Using Docker (Recommended)
The project is designed to be run within Docker containers.
- **Build and Start:** `docker compose up --build`
- **Run in Background:** `docker compose up -d`
- **Stop and Clean:** `docker compose down`

### Local Development
1. **Install Dependencies:** `npm install`
2. **Environment Variables:** Ensure a `.env` file is present in the root directory (refer to `.gitignore`).
3. **Firebase Credentials:** A `serviceAccountKey.json` file is required in the root for Firebase Admin SDK initialization.
4. **Run with Nodemon (Dev):** `npx nodemon src/server.ts` (requires `ts-node`) or simply `npm start`.

### External Tools
- **Webhook Testing:** `npx ngrok http 3000` is suggested for testing Polar/Stripe webhooks locally.

## Development Conventions

### Coding Style
- **TypeScript:** Strict typing is preferred. Use interfaces/types defined in `src/type.ts`.
- **Async/Await:** Use async/await for all asynchronous operations.
- **Error Handling:** Controllers should catch errors and return appropriate HTTP status codes (e.g., 400 for bad requests, 402 for insufficient balance, 500 for internal errors).

### API Design
- All API routes are prefixed with `/api`.
- **Webhooks:** The `/api/webhooks/polar` route requires raw body parsing, which is handled specifically in `src/app.ts` and `src/routes/index.ts`.
- **Authentication:** Use `authMiddleware` for routes requiring a logged-in user.

### Key Business Logic
- **Credit System:** Video generation involves a "debit" transaction from the user's `wallet_balance` in Firestore. If generation fails, credits are automatically reimbursed.
- **Persistence:** Video generation results (including the `outputUrl` link) are stored in a `generations` collection in Firestore. This avoids the need for uploading videos to Firebase Storage and bypasses associated CORS issues.
- **Mock Mode:** The `src/modules/videoService.ts` currently has a `MOCK_MODE` flag for testing generation without calling real AI APIs.

## TODOs / Next Steps
- Implement real AI API calls (Veo, Sora, etc.) in `src/modules/videoService.ts`.
- Complete the Google Gemini integration for prompt enhancement in `src/controller/ai.controller.ts`.
- Enhance job status tracking by persisting jobs in Firestore.
