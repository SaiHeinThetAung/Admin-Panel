
# Admin Panel Project

This is a full-stack admin panel application built with a React frontend, an Express.js backend, and a MySQL database. The project is containerized using Docker and orchestrated with Docker Compose for easy setup and deployment.

- **Frontend**: React with Vite, Ant Design, and Tailwind CSS.
- **Backend**: Express.js with MySQL for user management.
- **Database**: MySQL 8.0 for persistent data storage.

## Features
- User management (create, edit, ban, delete) with role-based access (admin/user).
- Responsive dashboard interface.
- Automatic database initialization with a seeded admin user.
- Containerized deployment with Docker.

## Project Structure
```
admin-panel/
├── backend/              # Express.js backend
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── server.js
│   └── ...
├── frontend/             # React frontend
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── src/
│   └── ...
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # This file
```

## Prerequisites
Before running the project, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 1.27 or higher)
- [Git](https://git-scm.com/downloads) (to clone the repository)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/SaiHeinThetAung/admin-panel.git
cd admin-panel
```
### 3. Build and Run with Docker Compose
Run the following command in the root directory (`admin-panel/`):
```bash
docker-compose up --build
```

- This builds the backend and frontend images and starts all services (backend, frontend, MySQL).
- The backend initializes the `users` table in the `admin_panel` database and seeds it with an admin user:
  - Username: `admin`
  - Email: `admin@example.com`
  - Password: `password`
  - Role: `admin`

Wait until you see logs indicating the services are running:
- Backend: `Server running on port 5005`
- Frontend: Served via Nginx on port 3001
- MySQL: Ready when healthcheck passes

### 4. Access the Application
- **Frontend**: Open `http://localhost:3001` in your browser to view the dashboard.
- **Backend API**: Access `http://localhost:5005/api/users` to verify the seeded user (use a tool like Postman or curl).
- **MySQL**: Optionally connect to `localhost:3306` with a MySQL client (e.g., MySQL Workbench) using `root`/`root` (or your updated password).

Example API call:
```bash
curl http://localhost:5005/api/users
```

---

## Usage
- **Login**: Use the seeded admin credentials (`email=admin@example.com`/`password=password`) to log in.
- **Admin Features**: Manage users (edit, ban, delete) via the dashboard.
- **User Features**: Non-admin users see a profile view.

To stop the application:
```bash
docker-compose down
```

To reset the database (e.g., for a fresh start):
```bash
docker-compose down -v
```

---

## Development
For local development without Docker:
1. **Backend**:
   - Navigate to `backend/`.
   - Install dependencies: `npm install`.
   - Set up a local MySQL instance and update `.env`:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=root
     DB_NAME=admin_panel
     JWT_SECRET=your_secret_key
     PORT=5005
     ```
   - Run: `npm run dev` (uses `nodemon`).

2. **Frontend**:
   - Navigate to `frontend/`.
   - Install dependencies: `npm install`.
   - Run: `npm run dev` (starts Vite dev server, typically on `http://localhost:5173`).
   - Update API calls to point to `http://localhost:5005/api` if needed.

---

## Docker Details
- **Backend**: Runs on `Node.js 20-slim`, listens on port 5005.
- **Frontend**: Built with Vite, served via `Nginx Alpine` on port 80.
- **MySQL**: Uses `mysql:8.0`, persists data in a Docker volume (`db-data`).

### Container Dependencies
- MySQL starts first and is health-checked.
- Backend waits for MySQL to be healthy before starting.
- Frontend waits for the backend.

---

## Troubleshooting
- **Backend Fails to Connect to MySQL**:
  - Check logs: `docker-compose logs backend`.
  - Ensure `DB_HOST=db` and passwords match in `docker-compose.yml`.
- **Frontend Can’t Reach Backend**:
  - Verify `VITE_API_URL=http://backend:5005/api` in `frontend` service.
- **Database Not Initialized**:
  - Confirm `server.js` has the initialization logic (see `backend/server.js`).
  - Reset with `docker-compose down -v` and retry.

---

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

---

## License
This project is licensed under the [ISC License](LICENSE) (see backend `package.json`).

---

Feel free to customize this further—e.g., add a login route example, specify additional features, or include a screenshot. Let me know if you need adjustments!
