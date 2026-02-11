# Edu AI Platform

An AI-powered educational SaaS platform that allows users to upload PDFs, ask questions via AI, and manage subscriptions.

# Edu AI - Smart Learning Platform

Edu AI is a modern, AI-powered educational SaaS platform that allows students to upload PDFs, ask questions via AI, and manage their learning journey.

## 🚀 Features

-   **📄 Smart PDF Analysis**: Upload research papers or textbooks and get instant summaries.
-   **🤖 AI Chat Assistant**: Interactive Q&A with your documents using Gemini AI.
-   **🎨 Premium Dark UI**: A professional, glassmorphic dark theme built with Tailwind CSS v4.
-   **🔐 Secure Authentication**: JWT-based login and registration system.
-   **💳 Subscription Plans**: Integrated Razorpay payment gateway for premium features.
-   **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion (ready).
-   **Backend**: Node.js, Express, MongoDB (Local/Atlas).
-   **AI Engine**: Google Gemini API.
-   **Database**: MongoDB.
-   **Payments**: Razorpay.

## ⚙️ Usage Guide

### Prerequisites
-   Node.js (v18+)
-   MongoDB (Running locally on port 27017)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd edu_ai_app
    ```

2.  **Install Dependencies**:
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client/vite-project
    npm install
    ```

3.  **Environment Setup**:
    -   **Server**: Update `server/.env` with your API keys:
        ```env
        PORT=5000
        MONGO_URI=mongodb://127.0.0.1:27017/edu_ai_app
        JWT_SECRET=your_strong_secret
        GEMINI_API_KEY=your_gemini_api_key
        RAZORPAY_KEY_ID=your_razorpay_key
        RAZORPAY_SECRET=your_razorpay_secret
        ```
    -   **Client**: Update `client/vite-project/.env` if needed:
        ```env
        VITE_API_URL=http://localhost:5000/api
        ```

4.  **Run the Application**:
    You can run both servers in separate terminals:
    ```bash
    # Terminal 1 (Server)
    cd server
    npm run dev

    # Terminal 2 (Client)
    cd client/vite-project
    npm run dev
    ```

5.  **Access the App**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Testing

-   **Register/Login**: create an account to access the dashboard.
-   **Upload**: Drag & drop a PDF in the "My PDFs" section.
-   **Chat**: Select a processed PDF and ask questions like "Summarize this document".

## 📂 Project Structure

-   `server/`: Backend API and Logic
    -   `models/`: Database schemas (User, PDF, Subscription)
    -   `routes/`: API routes
    -   `controllers/`: Request handling logic
    -   `utils/`: PDF parsing and helper functions
-   `client/vite-project/`: Frontend Application
    -   `src/components/`: Reusable UI components
    -   `src/pages/`: Application pages
    -   `src/context/`: Global state (Auth)
    -   `src/services/`: API integration

## ✨ Features

-   **PDF Upload & Parsing**: Extract text for AI analysis.
-   **AI Chat**: Interactive Q&A with documents.
-   **Subscriptions**: Tiered access using Razorpay.
-   **Authentication**: Secure signup/login flow.
