# MindBridge

MindBridge is an AI-powered mental wellness companion designed to provide accessible and personalized support. It leverages advanced language models to offer empathetic chat interactions, mood tracking, and stress analysis.

## Features

-   **AI Chat Assistant**: engaging and empathetic conversations powered by Google Gemini.
-   **Mood Analysis**: Real-time analysis of emotional states.
-   **Stress Monitoring**: Visual indicators of stress levels.
-   **Weekly Trends**: Track mood and stress over time.
-   **Daily Quiz**: Interactive scenarios to assess decision-making and mental state.
-   **Secure & Private**: Your data is handled with care.

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React.
-   **Backend**: FastAPI, Python, SQLite.
-   **AI**: Google Gemini API (`google-generativeai`).

## Setup

### Prerequisites

-   Node.js and npm
-   Python 3.8+
-   Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Mukasshaf/MindBridge.git
    cd MindBridge
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```
    - Create a `.env` file in the `backend` directory and add your API key:
      ```
      GEMINI_API_KEY=your_api_key_here
      ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend:**
    ```bash
    cd backend
    uvicorn main:app --reload
    ```

2.  **Start the Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```

3.  Open your browser and navigate to `http://localhost:8080`.

## License

[MIT License](LICENSE)
