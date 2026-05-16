# ⚡ TaskFlow | The Next Generation of Productivity

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://taskflow-yaahvi.vercel.app/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

TaskFlow is a premium, unified workspace designed for modern teams and individuals who demand speed, clarity, and real-time collaboration. Built with a focus on performance and minimalist aesthetics, TaskFlow simplifies your workflow through intuitive task management and visual data organization.

**🌐 Live Demo:** [taskflow-yaahvi.vercel.app](https://taskflow-yaahvi.vercel.app/)

---

## ✨ Key Features

### 🚀 Performance First
- **Real-time Synchronization**: Powered by Socket.io for instant updates across all connected clients.
- **Lightning Fast UI**: Built with vanilla JavaScript for maximum efficiency and zero framework overhead.
- **SEO Optimized**: Semantic HTML5 structure and optimized metadata for better discoverability.

### 🛠️ Workspace Management
- **Interactive Dashboard**: Get a high-level overview of your productivity with data-driven insights.
- **Kanban Boards**: Drag-and-drop tasks through custom stages to visualize progress.
- **Smart Tasks**: Detailed task tracking with priority levels, deadlines, and categories.
- **Integrated Calendar**: Schedule and manage deadlines with a visual calendar interface.

### 🔐 Secure & Collaborative
- **Multi-Auth System**: Support for Email/Password, Google OAuth, and GitHub OAuth via Passport.js.
- **Encrypted Data**: Industry-standard security with JWT, bcryptjs, and Helmet.js.
- **Collaboration**: Real-time notifications and shared workspaces (in development).

---

## 🎨 Design Philosophy

TaskFlow follows a **Premium Dark Aesthetics** approach:
- **Glassmorphism**: Subtle translucency and blur effects for a modern depth feel.
- **Dynamic Gradients**: Vibrant HSL-tailored colors and smooth transitions.
- **Responsive Layout**: Seamless experience from desktop ultrawides to mobile devices.
- **Micro-animations**: Enhanced engagement through subtle hover effects and interactive feedback.

---

## 🏗️ Technical Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Vanilla JS, CSS3 (Custom Variables), HTML5, Lucide Icons, Chart.js |
| **Backend** | Node.js, Express.js (v5), Mongoose (MongoDB) |
| **Real-time** | Socket.io |
| **Security** | JWT, bcryptjs, Helmet, Express Rate Limit, Express Validator |
| **Auth** | Passport.js (Google & GitHub Strategies) |
| **Utilities** | Multer (Files), Nodemailer (Email), Morgan (Logging), dotenv |

---

## 📂 Project Structure

```bash
taskflow/
├── public/                 # Frontend Assets
│   ├── css/                # Modular CSS architecture
│   │   ├── pages/          # Page-specific styles (Dashboard, Calendar, etc.)
│   │   └── variables.css   # Global design tokens
│   ├── js/                 # Client-side logic
│   ├── img/                # Static images & branding
│   └── *.html              # Semantic HTML5 templates
├── server/                 # Backend Architecture (MVC)
│   ├── config/             # Database & Passport configurations
│   ├── controllers/        # Business logic & request handling
│   ├── middleware/         # Auth, error handling, & security filters
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoint definitions
│   └── utils/              # Helper functions & services
├── vercel.json             # Vercel deployment configuration
└── package.json            # Dependency management & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/parekhyaahvi/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   
   # OAuth (Optional)
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   GITHUB_CLIENT_ID=your_id
   GITHUB_CLIENT_SECRET=your_secret
   ```

4. **Run the application**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

---

## 📄 License
This project is licensed under the ISC License.

---

Built with ❤️ by [Yaahvi Parekh](https://github.com/parekhyaahvi)
