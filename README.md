# 📚 Library Management System

A full-stack **Library Management System** built with **ASP.NET Core 8 (MVC + Web API)** for the backend and **React.js** for the frontend. It features role-based access for **Admin** and **Student**, book lending, due tracking, and more — all powered by a clean, maintainable architecture.

---

## ✨ Features

### 🔐 Authentication

- JWT-based login for **Admin** and **Student**
- Token-based role authorization

### 📚 Book Management

- Add, edit, delete books (Admin only)
- View books (Admin + Student)

### 🔄 Lending System

- Admin can lend books to students
- Track return dates and dues
- Mark loans as **cleared** or **pending**

### 👥 Student Management

- Admin can manage student records
- View individual loans

### 📊 Dashboard

- Role-based summary of:
  - Total books
  - Loans
  - Pending dues

---

## 🏗️ Architecture

Follows **Domain-Driven Design (DDD)** principles with:

- `Library.Domain` – core entities and interfaces
- `Library.Infrastructure` – in-memory or database repositories
- `Library.Controllers` – Web API controllers
- `React Frontend` – UI with protected routes and role-specific views

---

## 🧪 Tech Stack

| Layer    | Tech                           |
| -------- | ------------------------------ |
| Frontend | React.js, TailwindCSS, Axios   |
| Backend  | ASP.NET Core 8 (MVC + Web API) |
| Auth     | JWT Authentication             |
| Pattern  | MVC, DDD, CQRS (optional)      |
| Database | MongoDB                        |

---

## 🚀 Getting Started

### ✅ Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- [Visual Studio / VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) (optional for API testing)

---

### 🔧 Backend Setup

```bash
cd Library
dotnet build
dotnet run
```
