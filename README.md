# Luna Health - Your Intelligent AI Health Companion 👩‍⚕️✨

Luna Health is a full-stack MERN application that serves as a personalized AI health assistant. Users can interact with an intelligent AI (powered by Google's Gemini) to discuss their health, analyze medical reports, and seamlessly manage their appointments. The application is built with a secure, modern, and robust architecture, featuring a React frontend and a Node.js/Express backend.

## 🚀 Live Demo

**You can access the live application here:** [**luna-health-ashishdara.vercel.app**](https://aura-health-o983.vercel.app/)

*(Note: The backend is hosted on Railway's free tier, so the first request might take a few seconds to "wake up" the server.)*

---

## ✨ Features

* **Secure User Authentication:** JWT-based authentication for user registration and login.
* **Personalized AI Chat:** The AI's responses are tailored to the user's specific health profile (blood type, allergies, etc.).
* **Voice-to-Text & Text-to-Speech:** Full voice-powered interaction with the chat assistant.
* **Smart Appointment Management:** Create and cancel appointments using natural language.
* **Intelligent Date & Time Parsing:** Utilizes a dedicated library (`chrono-node`) for highly accurate appointment scheduling, avoiding AI hallucinations.
* **PDF Health Report Analysis:** Upload a PDF report and ask the AI to summarize and explain the details.
* **Automated Email Notifications:** Receive AI-generated welcome emails, appointment confirmations (with "Add to Google Calendar" links), and cancellation notices.
* **Responsive UI:** A clean and modern user interface built with Material-UI.

---
## 🛠️ Technologies Used

This project uses a modern MERN stack and various services to deliver its features.

#### Frontend

* **React:** The core UI library.
* **Vite:** A next-generation frontend build tool for a fast development experience.
* **Material-UI (MUI):** A comprehensive suite of UI tools to build a clean and responsive interface.
* **Axios:** A promise-based HTTP client for making API calls to the backend.
* **React Speech Recognition:** A hook for adding voice-to-text functionality.

#### Backend

* **Node.js & Express:** The runtime environment and web framework for building the REST API.
* **MongoDB:** A NoSQL database used to store user data, chat history, and appointments.
* **Mongoose:** An Object Data Modeling (ODM) library for MongoDB and Node.js.

#### AI & Services

* **Google Gemini:** The Large Language Model (LLM) powering the AI's conversational abilities, personalization, and creative text generation.
* **Chrono-Node:** A natural language date parsing library used for accurately extracting dates and times for appointment booking.
* **Nodemailer:** A module for sending automated emails from the Node.js server.
* **Mailtrap:** An email testing service used during development to safely inspect emails.

#### Deployment

* **Vercel:** A cloud platform for deploying the frontend (client).
* **Railway:** A cloud platform for deploying the backend (server).

---
## 🌊 Application Flow

### For a General User

A user's journey through Luna Health is designed to be simple and intuitive:
1.  **Register:** Create a new account, providing basic login credentials and an optional health profile to personalize the AI.
2.  **Login:** Sign in to the secure chat interface.
3.  **Interact:** Start a conversation with Luna via text or by clicking the microphone for voice commands.
4.  **Manage Appointments:** Ask Luna to "schedule an appointment for tomorrow at 5 pm" or "cancel my last appointment."
5.  **Analyze Reports:** Upload a PDF health report and ask questions like "can you summarize this for me?"
6.  **Stay Informed:** Receive automatic email confirmations for all important actions.

### Technical Deep Dive

For a technical user, the logic for each key feature is as follows:

* **Authentication:** When a user registers or logs in, the server generates a JSON Web Token (JWT). This token is sent to the client and stored in `localStorage`. For every subsequent API request to a protected route, this token is sent in the `Authorization` header. A `protect` middleware on the backend verifies this token to identify and authenticate the user.

* **Appointment Creation:** This is a hybrid process designed for maximum accuracy.
    1.  The user's request (e.g., "book a checkup for tomorrow at 3:00 p.m.") is sent to the backend.
    2.  The backend uses **`chrono-node`** to parse the message and precisely extract the date and time. This avoids AI errors and ensures the time is correct.
    3.  The backend then sends a separate request to **Gemini** with the sole task of creating a clean *title* for the appointment (e.g., "Checkup").
    4.  A new `Appointment` document is saved to MongoDB with the `userId`, the precise date from `chrono-node`, and the title from Gemini.
    5.  `Nodemailer` sends a confirmation email, which includes a dynamically generated link to add the event to the user's Google Calendar.

* **Appointment Cancellation:**
    1.  The user's request (e.g., "cancel my checkup") is sent to the backend along with the recent chat history.
    2.  **Gemini** is used to analyze the conversation history to identify the *title* of the specific appointment the user wants to cancel.
    3.  The backend queries the database to find and delete the appointment that matches both the extracted title and the authenticated `userId`.
    4.  `Nodemailer` sends a cancellation confirmation email.

* **PDF Report Analysis:**
    1.  The frontend uploads the file to a dedicated backend route.
    2.  `Multer` middleware on the server handles the multipart/form-data.
    3.  The `pdf-parse` library reads the file buffer and extracts all the text content.
    4.  This text, along with a specialized system prompt, is sent to **Gemini** for analysis.
    5.  The user's request and the AI's response are both saved as `Chat` documents in MongoDB, linked to the `userId`.

---

## 🔮 Future Improvements

While Luna Health is fully functional, there are several exciting features planned for future versions:

1.  **Enhanced UI/UX:** Further improve the user interface with custom animations, themes (like a dark mode), and a focus on accessibility to ensure a delightful experience for all users.
2.  **"Hey Luna" Wake Word:** Implement a hands-free activation feature using a "wake word" (similar to "Hey Siri"). This would allow users to start a conversation with the AI without needing to click the microphone, making the interaction even more seamless.

---
## 🗺️ API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint                  | Description                                | Protected |
| :----- | :------------------------ | :----------------------------------------- | :-------- |
| `POST` | `/auth/register`          | Register a new user.                       | No        |
| `POST` | `/auth/login`             | Log in a user and get a JWT.               | No        |
| `GET`  | `/chat`                   | Get the chat history for the logged-in user. | **Yes** |
| `POST` | `/chat`                   | Send a new message to the chat AI.         | **Yes** |
| `GET`  | `/appointments`           | Get all upcoming appointments for the user. | **Yes** |
| `PATCH`| `/appointments/:id`       | Update the status of an appointment (e.g., to "Completed"). | **Yes** |
| `POST` | `/reports/analyze`        | Upload and analyze a PDF health report.    | **Yes** |

---
## 🚀 Local Setup & Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AshishDara/AuraHealth.git](https://github.com/AshishDara/AuraHealth.git)
    cd AuraHealth
    ```
2.  **Setup Backend:**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `/server` directory and add the following variables:
    ```env
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_gemini_api_key
    JWT_SECRET=your_jwt_secret
    EMAIL_HOST=your_mailtrap_host
    EMAIL_PORT=your_mailtrap_port
    EMAIL_USER=your_mailtrap_user
    EMAIL_PASS=your_mailtrap_pass
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../client
    npm install
    ```
    The frontend does not require a `.env` file for local development as it defaults to `http://localhost:5001`.

4.  **Run the Application:**
    * In one terminal, start the backend server (from the `/server` directory): `npm start`
    * In another terminal, start the frontend client (from the `/client` directory): `npm run dev`