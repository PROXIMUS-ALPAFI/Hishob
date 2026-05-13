# Hishob

Personal budget tracker.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run server + client in dev mode |
| `npm run desktop` | Build client and launch Electron |
| `npm run desktop:dev` | Run Electron in dev mode with hot reload |
| `npm run desktop:dist` | Package into Windows installer |
| `npm run dist` | Build client + package with electron-builder |

## Project Structure

```
server.js                 Express API entry point
electron/main.js          Electron main process
client/                   React frontend
config/                   Database connection
controllers/              Route handlers
routers/                  Express routes
models/                   Mongoose schemas
middleware/               Express middleware
```

## Environment Variables

Copy `.env.example` (or create a `.env` file):

```
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
```
