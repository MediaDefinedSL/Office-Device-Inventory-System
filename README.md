# Office Device Inventory & Service Tracking System

A full-stack web application for managing office devices, employee assignments, service tracking, purchases, tickets, and reporting in a single platform.

## GitHub Repository

- Repository: https://github.com/your-username/Office-Device-Inventory-System
- Project Type: Full-Stack Web App
- Tech Stack: Node.js, Express, MongoDB, React, Vite, Material UI

## Overview

This system helps organizations keep track of:

- Office devices and equipment inventory
- Device assignment history to employees
- Repair and service tracking
- Purchase records and costs
- Support tickets and issue management
- User roles and access control
- Dashboard analytics and reports

## Features

- Device inventory management
- Employee and user management
- Device assignment and return tracking
- Service log creation and tracking
- Purchase records management
- Support ticket management
- Notifications and alerts
- Analytics and reports dashboard
- QR code generation and scanning support
- Responsive frontend for desktop and laptop use

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- CORS
- Dotenv

### Frontend
- React
- Vite
- Material UI
- React Router
- Recharts
- Axios
- QR code generation and scanning

## Project Structure

```bash
Office-Device-Inventory-System/
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   ├── package.json
│   └── ...
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── app.js
├── package.json
├── README.md
├── vercel.json
└── ...
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Office-Device-Inventory-System.git
cd Office-Device-Inventory-System
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd Frontend
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root or backend folder depending on your setup and add values such as:

```env
MONGO_URI=mongodb://localhost:27017/office-device-inventory
JWT_SECRET=your_secret_key
PORT=8000
```

### 5. Run the application

#### Backend

```bash
npm run dev
```

#### Frontend

```bash
cd Frontend
npm run dev
```

The frontend will run in development mode, and the backend API will serve requests on the configured port.

## Scripts

### Root project

```bash
npm start
npm run dev
npm run build
```

### Frontend

```bash
cd Frontend
npm run dev
npm run build
npm run preview
```

## GitHub Workflow

To contribute:

1. Fork the project on GitHub
2. Create a feature branch
3. Commit your changes
4. Push to your fork
5. Open a pull request

Example:

```bash
git checkout -b feature/device-reporting
git add .
git commit -m "Add device reporting feature"
git push origin feature/device-reporting
```

## License

This project is available for educational and internal business use. Add a proper license file if you plan to publish it publicly on GitHub.

## Contact

For inquiries, collaboration, or project support, contact the project owner or repository maintainer on GitHub.

## Notes

- Update the GitHub repository URL with your actual username/repository name.
- Add a `.env.example` file for easier onboarding.
- Consider adding screenshots or demo videos to improve project presentation on GitHub.
