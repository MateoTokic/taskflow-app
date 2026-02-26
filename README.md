# 🚀 TaskFlow

TaskFlow is a full-stack web application for managing **projects and tasks**.  
It allows users to register, log in, create projects, and manage tasks within each project.

## 🛠 Tech Stack

- ASP.NET Core Web API
- PostgreSQL
- React + TypeScript (Vite)
- JWT Authentication

---

## 📸 Features

### 🔐 Authentication
- User registration
- User login
- JWT-based authentication
- Protected API endpoints

### 📁 Projects
- Create project
- Update project
- Delete project
- View all projects for logged-in user

### ✅ Tasks
- Create task inside a project
- Toggle task completion
- View tasks per project
- Delete project with related tasks

---

## ⚙️ Backend Setup

### 1. Navigate to backend

```bash
cd backend/TaskFlow.API/TaskFlow.API
```

### 2. Configure Database

Create `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=taskflow_db;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY",
    "Issuer": "TaskFlowAPI",
    "Audience": "TaskFlowAPIUsers",
    "DurationInMinutes": 60
  }
}
```

### 3. Apply migrations

```bash
dotnet ef database update
```

### 4. Run backend

```bash
dotnet run
```

Swagger will be available at:

```
https://localhost:7008/swagger
```

---

## 💻 Frontend Setup

### 1. Navigate to frontend

```bash
cd frontend/taskflow-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔐 Authentication Flow

1. User registers
2. User logs in
3. Backend returns JWT token
4. Token stored in `localStorage`
5. Axios attaches token to protected API requests
6. Backend validates JWT via `[Authorize]`

---

## 🗄 Database Schema

### Users
- Id (Guid)
- Email
- PasswordHash

### Projects
- Id (Guid)
- Name
- Description
- UserId (FK → Users)

### Tasks
- Id (Guid)
- Title
- Description
- IsCompleted
- ProjectId (FK → Projects)

---

## 📌 Future Improvements

- Dark mode
- Task editing
- Due dates
- Drag & drop
- Docker support
- Cloud deployment

---

## 👨‍💻 Author

Mateo Tokić