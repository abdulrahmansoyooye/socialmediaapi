# 🧱 Social Media Microservices Backend

A distributed **microservices-based social media platform** built with scalability, security, and developer experience in mind. Each major feature is split into its own service.

---

## 🔧 Tech Stack

- **Node.js / Express** – Service logic  
- **MongoDB / Mongoose** – Primary database  
- **Redis** – Caching & session/token storage  
- **RabbitMQ** – Background jobs & message brokering  
- **JWT** – Authentication & token security  
- **Docker + Docker Compose** – Local development & containerization  
- **Nginx** – API gateway & reverse proxy  
- **Winston** – Logging  
- **Swagger / Postman** – API documentation  

---

## 📦 Folder Structure

social-media-app/
├── docker-compose.yml
├── gateway/                # API Gateway
│   └── index.js
├── services/
│   ├── auth/               # Signup, login, token auth
│   ├── user/               # Profiles, followers
│   ├── post/               # Posts CRUD
│   ├── comment/            # Comments CRUD
│   ├── like/               # Like/unlike system
│   ├── notification/       # Notification system
│   └── queue/              # RabbitMQ message consumer
├── shared/                 # Shared utils, middleware
├── .env
└── README.md




---

## 📌 Microservices Overview

| Service               | Description                                       |
|-----------------------|---------------------------------------------------|
| **Auth Service**      | Handles sign up, login, password hashing, and token creation |
| **User Service**      | Profile info, followers/following logic          |
| **Post Service**      | CRUD for posts                                   |
| **Comment Service**   | CRUD for post comments                           |
| **Like Service**      | Like/unlike on posts/comments                    |
| **Notification Service** | Notifies users of events via RabbitMQ       |
| **Queue Worker**      | Processes background tasks                       |
| **API Gateway**       | Unified entry point to the microservices         |

---

## 🔐 Authentication Flow

On login, user receives:

- `accessToken` – expires in ~15 mins  
- `refreshToken` – longer-lived and stored in HTTP-only cookie  

Token Handling:

- On expiration, `POST /refresh-token` issues a new token pair  
- On logout, refresh token is removed from the database  

---

## 🔄 Inter-Service Communication

| Type       | Used For                                      |
|------------|-----------------------------------------------|
| **REST API**   | Simple CRUD and direct requests               |
| **RabbitMQ**   | Background tasks like notifications, logging, email sending |


---

## 🚀 Dev & Deployment

- Containerized via **Docker**  
- Local orchestration using **docker-compose**  
- Environment variables managed using `.env` files  
- Production-ready deployment on:
  - Render / Railway (for demo)

---

## 📚 API Documentation

- Swagger UI for each service: `http://localhost:<PORT>/docs`  
- Postman collection: `/docs/postman-collection.json`

---

## 📈 Logging & Monitoring

- **Winston** for structured logs (file + console)  
- Optional integrations:
  - **Prometheus + Grafana** for service metrics  
  - **RabbitMQ Admin UI** for queue visualization and management  

---

## 📈 Sample Auth Flow (Mermaid Diagram)

```mermaid
sequenceDiagram
    participant Client
    participant AuthService
    participant Redis
    participant UserService

    Client->>AuthService: POST /login (email, password)
    AuthService->>UserService: validate credentials
    AuthService->>Redis: store refresh token
    AuthService-->>Client: accessToken + refreshToken
