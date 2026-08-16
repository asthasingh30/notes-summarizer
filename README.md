# MyNoteBud — AI Notes Summarizer

Paste class notes or a textbook paragraph, get a clean AI summary, and every summary is saved
to your account so you can revisit it later.

- **Backend:** Node + Express, Mongoose (MongoDB), JWT auth, OpenAI API
- **Frontend:** React + Vite, React Router

```
notes-summarizer/
├── backend/     Express API, MongoDB models, JWT auth, OpenAI call
└── frontend/    React app (login/signup, summarizer, history)
```

---

## 1. Fixing your "difficulty connecting to server" signup error

That error almost always comes from one of these four things. Check them in order:

### A. The `<db_password>` placeholder wasn't replaced
Your connection string had `<db_password>` literally in it:
```
mongodb+srv://asthasingh1828_db_user:<db_password>@cluster0.8loce6z.mongodb.net/...
```
The angle brackets are a placeholder from the Atlas UI — they must be replaced with your
**actual password**, with no `<` `>` characters, e.g.:
```
mongodb+srv://asthasingh1828_db_user:MyRealPassword123@cluster0.8loce6z.mongodb.net/notes-summarizer?retryWrites=true&w=majority&appName=Cluster0
```
Also note the `/notes-summarizer` added before the `?` — this tells MongoDB which database to
use. Without it, Mongoose connects but everything lands in a default `test` database, which
usually isn't what you want.

> If your password contains special characters (`@`, `#`, `%`, `/`, etc.), you must
> [URL-encode them](https://www.mongodb.com/docs/manual/reference/connection-string/#special-characters-in-connection-strings)
> or the connection will fail with a parsing error.

### B. Atlas Network Access hasn't whitelisted your IP
In Atlas: **Network Access → Add IP Address**. For local development, add your current IP, or
`0.0.0.0/0` to allow from anywhere (fine for a dev/learning project, not for production).

### C. The backend server isn't actually running
Your frontend is on `localhost:5173` (Vite's default port) but it talks to a separate backend
(default `localhost:5000` here). If the backend process isn't running, or crashed on startup
because of `MONGO_URI`, every signup/login request from the frontend will fail with a network
error. Check the backend's terminal — `connectDB` in this project logs a specific reason
(bad auth, DNS issue, IP not whitelisted, etc.) if the connection fails.

### D. CORS mismatch
The backend only accepts requests from `CLIENT_URL` in `backend/.env` (defaults to
`http://localhost:5173`). If your frontend runs on a different port, update that value.

---

## 2. Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (you already have one)
- An OpenAI API key from https://platform.openai.com/api-keys

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
- `MONGO_URI` — your real Atlas connection string (see section 1A above)
- `JWT_SECRET` — any long random string (the `.env.example` file has a command to generate one)
- `OPENAI_API_KEY` — your OpenAI key
- `PORT` — defaults to 5000
- `CLIENT_URL` — defaults to `http://localhost:5173`

```bash
npm run dev
```

You should see:
```
MongoDB connected: cluster0.xxxxx.mongodb.net
Server running on http://localhost:5000
```

Sanity check: open http://localhost:5000/api/health in a browser — it should return
`{"status":"ok", ...}`.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 — you should land on the login page. Click "Sign up" to create an
account.

---

## 3. How it fits together

- **Signup/Login** (`POST /api/auth/signup`, `POST /api/auth/login`) — passwords are hashed with
  bcrypt before being stored; a JWT is returned and saved in `localStorage` on the frontend, then
  attached as `Authorization: Bearer <token>` on every later request (see `frontend/src/api/axios.js`).
- **Summarise** (`POST /api/summarise`, protected route) — takes `{ text }`, calls the OpenAI API
  (`gpt-4o-mini`), and saves a `Summary` document `{ userId, originalText, summary, createdAt }`
  tied to `req.user._id` from the verified JWT.
- **History** (`GET /api/summaries`, protected route) — returns all summaries for the logged-in
  user only, newest first. The frontend's "My Summaries" page lists them by date, with each
  entry expandable to show the original pasted text.
- **Auth middleware** (`backend/middleware/authMiddleware.js`) — verifies the JWT on every
  protected route and rejects the request if it's missing, invalid, or expired, which is what
  makes the summaries "tied to the logged-in user" rather than global.

## 4. Notes on the "remembers context across sessions" goal

This is the minimal version of that idea: each summary is persisted with the user who created
it, so it survives logging out, closing the browser, or coming back a week later — the "memory"
lives in MongoDB, not in the browser tab. From here, natural next steps toward richer context
would be: letting a user tag/organize summaries by course or topic, or feeding a user's past
summaries back into the AI prompt so future summaries can reference earlier ones.
