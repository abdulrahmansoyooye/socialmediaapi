A distributed microservices-based social media platform designed to scale and handle user interactions such as authentication, posts, comments, likes, and follow relationships.

Each feature is broken into its own service for maintainability, scalability, and performance.

🧱 Tech Stack
Node.js / Express – Core backend framework

MongoDB with Mongoose – Primary database

Redis – Caching and token/session management

RabbitMQ – Messaging and task queues

JWT – Authentication & Authorization

Docker + Docker Compose – Containerization

Nginx – Reverse proxy and load balancing

Swagger / Postman – API documentation

Winston – Logging

🧩 Microservices Structure
Service	Description
Auth Service	Handles user sign up, login, password hashing, JWT token creation, refresh tokens
User Service	Manages profiles, follow/unfollow actions, user search
Post Service	CRUD operations for posts (text, media), user timeline
Comment Service	CRUD for comments on posts
Like Service	Likes/unlikes on posts and comments
Notification Service	Sends in-app notifications (e.g., new like, new follower)
Gateway/API Gateway	Routes external requests to proper internal services
Queue Service	(optional) Background job processor via RabbitMQ

📦 Folder Structure (example with monorepo)
pgsql
Copy
Edit
social-media-app/
│
├── docker-compose.yml
├── gateway/
│   └── index.js
├── services/
│   ├── auth/
│   ├── user/
│   ├── post/
│   ├── comment/
│   ├── like/
│   ├── notification/
│   └── queue/
├── shared/
│   └── utils/
│   └── middleware/
├── .env
└── README.md
🔑 Authentication Flow (JWT + Refresh Tokens)
Users login and receive:

Access Token (short-lived)

Refresh Token (stored in Redis/DB, long-lived)

When Access Token expires, a request to /refresh-token issues new tokens

Logout deletes the refresh token

🔃 Communication Patterns
Services communicate using:

REST (internal and external) for simplicity

RabbitMQ for:

async jobs (like sending notifications, logging activity)

fail-safe task retries

🧪 Testing
Jest and Supertest for unit and integration tests

Each service has its own test suite

RabbitMQ jobs tested using mocks and integration tests

🧰 Dev & Deployment
Dockerized all services

Docker Compose for local orchestration

Environment variables managed using .env per service

Can be deployed to:

Kubernetes (Helm)

Railway / Render (for demo)

AWS ECS + SQS (for production scale)

🧾 API Documentation
Each service exposes a /docs endpoint with Swagger UI. Postman collection also available in /docs/postman-collection.json.

📊 Metrics & Observability
Winston for logging (file + console)

Optional: Prometheus + Grafana for service monitoring

RabbitMQ admin dashboard for tracking message queues

