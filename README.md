# 🤖 CoDev 

CoDev  is a full-stack real-time collaborative development platform where project collaborators can chat, write, edit, and run code directly in the browser — powered by WebSockets, Google Generative AI, and WebContainer. Just mention `@ai` to generate modular code, which is shared live with all collaborators in the project space.

---

## 🚀 Features

- **🗨️ Project-Based Real-Time Chat** – Collaborators can chat within their specific project workspace and also create their own custom file and folder structure collaboratively in real time..
- **🧠 Ask @ai** – Mention `@ai` in chat to:
  - Ask programming questions
  - Generate backend/frontend code
  - Get complete modular file structures (routes, controllers, package.json, etc.)
- **💻 Live In-Browser Code Editor**
  - View & edit AI-generated code live
  - Files are shared with all collaborators
  - Code can be tested and executed directly in the browser
- **👥 Team Management**
  - Add/remove collaborators in real-time
  - Shared file system per project
- **⚡ WebSockets Integration**
  - Real-time syncing of chat and code
- **🌐 Powered by Google Generative AI**
- **🔐 Secure**
  - JWT-based authentication
  - Redis for session/caching layer

---

## 🛠 Tech Stack

| Layer     | Tech Used |
|-----------|-----------|
| Frontend  | React + Vite, Tailwind CSS, WebSockets |
| Backend   | Node.js, Express, MongoDB, Redis, Socket.io |
| AI API    | Google Generative AI (@google/generative-ai) |
| Execution | WebContainer (Browser-based execution) |
| Auth      | JWT + Cookies |

---
## 🤖 Using the AI Feature

Type `@ai` followed by a request in the project chat.

Example: `@ai generate an express server with MongoDB connection and routes`

CoDev  will:

- Respond in chat
- Create and share modular files like `server.js`, `routes.js`, `package.json`, etc.
- Load them into the shared file explorer

All collaborators can:

- Edit these files
- Run them directly in-browser (via WebContainer)

---

## 👥 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you’d like to change.

---
## 📸 Screenshots
![Image](https://github.com/user-attachments/assets/16466280-d355-4395-ac5b-d2e91dd56dae)

![Image](https://github.com/user-attachments/assets/004457e8-c257-4eb4-9c03-1124ca5660c1)

![Image](https://github.com/user-attachments/assets/e3563a20-4f05-49aa-aafc-82e419964cc5)

![Image](https://github.com/user-attachments/assets/72306e7a-9153-45d7-8618-7d89f5a59357)

![Image](https://github.com/user-attachments/assets/ef640f6d-8999-4270-94b5-d0955031f416)

![Image](https://github.com/user-attachments/assets/285b9129-4373-40ad-a75c-cf0c08e7f340)

![Image](https://github.com/user-attachments/assets/bda45a36-039d-41c5-9fde-a5f4727bde8e)

![Image](https://github.com/user-attachments/assets/8fe0b43d-a77f-4f59-811e-82b588d0096b)

![Image](https://github.com/user-attachments/assets/463d12da-cd92-4731-8d7f-25f6b53a6cb0)
---
# 🔧 Environment Setup

## 🔐 Backend `.env` file

```ini
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
GOOGLE_AI_KEY=your_google_ai_api_key


##🌐 Frontend .env file (client/.env)
ini
Copy
Edit
VITE_API_URL=http://localhost:3000

---
#🧪 Running the Application
##📥 Clone & Install
bash
Copy
Edit
git clone https://github.com/yourusername/CoDev.git
cd CoDev
🚀 Start Backend
bash
Copy
Edit
cd server
npm install
npm start
💻 Start Frontend
bash
Copy
Edit
cd client
npm install
npm run dev
---


## 📁 Directory Structure (Overview)

```bash
CoDevAI/
├── frontend/          # Frontend (React + Vite)
├── backend/           # Backend (Express, MongoDB, Redis, Socket.io)
├── .env               # Environment variables
└── README.md





