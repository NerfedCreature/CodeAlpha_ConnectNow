# ConnectNow 🌐

ConnectNow is a modern, real-time social networking web application built with a full-stack JavaScript architecture. It features a sleek glassmorphism UI, real-time messaging, a dynamic global notification system, and robust social interaction tracking.

## 🚀 Features

*   **Real-Time Direct Messaging:** Chat seamlessly with other users. Messages are delivered instantly using WebSockets (`socket.io`) without needing to refresh the page.
*   **Global Notification System:** Stay updated with real-time iOS-style red notification badges on your navbar. Get instantly alerted when someone follows you, comments on your post, or likes your post.
*   **Robust Social Feeds & Discovery:** 
    *   **Global Feed:** See posts from everyone on the platform.
    *   **Following Feed:** A curated feed showing only posts from users you follow.
    *   **Discover Page:** Browse and follow new users on the platform.
*   **Like & Comment System:** Interact with posts by leaving comments or toggling a robust "Like" button that accurately tracks state and prevents infinite reacts.
*   **Deep-Linked Notifications:** Click on any comment or like notification to be smoothly redirected to a dedicated Post View page.
*   **Dynamic Avatars:** User profile icons are automatically generated using initials based on their First and Last name.
*   **Beautiful UI/UX:** Built with a premium, responsive CSS framework utilizing smooth animations and glassmorphism.

## 🛠️ Tech Stack

*   **Frontend:** React, React Router, Vite, Lucide Icons
*   **Backend:** Node.js, Express.js
*   **Real-time engine:** Socket.io
*   **Database:** SQLite, Sequelize (ORM)
*   **Authentication:** JWT (JSON Web Tokens) & bcrypt for password hashing

## 💻 Getting Started

Follow these steps to run ConnectNow locally on your machine.

### Prerequisites
*   Node.js installed (v16+ recommended)
*   npm (Node Package Manager)

### 1. Backend Setup
Navigate into the `backend` directory, install dependencies, and start the server.
```bash
cd backend
npm install
npm start
```
The backend server will run on `http://localhost:5000` and automatically create the SQLite database (`connectnow.sqlite`).

### 2. Frontend Setup
Open a new terminal window, navigate into the `frontend` directory, install dependencies, and start the development server.
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be available at the URL provided by Vite (usually `http://localhost:5173`).

## 🤝 Contributing
Feel free to fork the repository and submit pull requests for any features, bug fixes, or enhancements!
