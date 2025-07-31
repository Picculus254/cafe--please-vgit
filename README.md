# CAFÈ PLEASE ☕️

An application for assistants and managers to handle 'Not Ready' status requests like breaks and lunches, featuring manual and automatic approval systems, queue management, and performance metrics.

## Features

-   **Role-Based Access**: Separate login and dashboards for Assistants and Managers/Admins.
-   **Request Management**: Assistants can request breaks, lunches, and other status changes.
-   **Real-time Queues**: View pending and active requests for each team (Inbound, Outbound, Amigo).
-   **Manual & Automatic Approvals**: Managers can manually approve/reject requests. A configurable bot can auto-approve requests based on team-specific limits.
-   **Gamification**: A leaderboard ranks assistants based on their request handling performance (completed, rejected, expired, etc.).
-   **Sales Performance**: Track and rank assistants based on reported sales numbers.
-   **Statistics & Reporting**: View graphical statistics of requests over time, with filters and CSV export functionality.
-   **User Management**: Managers/Admins can add, edit, and remove users.
-   **System Settings**: Admins can configure bot behavior, request limits, and timers.
-   **Notifications**: Real-time feedback for user actions.
-   **Audio Cues**: Sound notifications for request approvals and warnings.

## Tech Stack

-   **Frontend**: React 19, TypeScript
-   **Routing**: React Router
-   **Styling**: Tailwind CSS (via CDN)
-   **UI Components**: Custom components, `lucide-react` for icons
-   **State Management**: React Context API with `useReducer`
-   **Charts**: `recharts`
-   **Data Persistence**: Browser `localStorage` (Mock API)
-   **E2E Testing**: Playwright

## Getting Started

This project is a static single-page application and does not require a complex build process.

### Prerequisites

You need a modern web browser. A local web server is recommended to avoid issues with browser security policies (e.g., for audio).

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Serve the application:**
    You can use any simple static file server. A common choice is `serve`. If you don't have it, you can install it via npm:
    ```bash
    npm install -g serve
    ```
    Then, run it from the project root:
    ```bash
    serve .
    ```

3.  **Access the app:**
    Open your web browser and navigate to the URL provided by the server (e.g., `http://localhost:3000`).

## Running E2E Tests

The project includes an end-to-end test suite using Playwright.

1.  **Install Playwright browsers:**
    (This might be needed the first time you run the tests)
    ```bash
    npx playwright install
    ```

2.  **Run the tests:**
    ```bash
    npx playwright test
    ```
