# MyNoteBud – AI-Powered Notes Summarizer

MyNoteBud is an AI-powered web application that helps students turn lengthy study notes into clear, concise summaries. It makes studying and revision easier by reducing information overload and organizing important concepts.

## ✨ Features

- **AI-Powered Summarization:** Generate concise summaries from lengthy notes using Google Gemini AI.
- **User Authentication:** Secure signup and login functionality.
- **Personal Summary History:** Save and access previously generated summaries.
- **MongoDB Integration:** Store user accounts and summaries in a database.
- **Delete Summaries:** Remove summaries you no longer need.
- **Responsive Interface:** Clean and user-friendly design.
- **Character Counter:** Track the length of notes entered.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- CSS
- Axios

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)

**AI Integration**
- Google Gemini API (`@google/genai`)

## 📁 Project Structure

```text
notes-summarizer/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
│
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/notes-summarizer.git
cd notes-summarizer
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start the backend

```bash
npm run dev
```

### 4. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5001/api
```

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

## 🔐 Environment Variables

Never upload your actual API keys, database credentials, JWT secrets, or `.env` files to GitHub.

Use the example environment files as templates.

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome!

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit and push your changes.
5. Open a Pull Request.

## 👩‍💻 Acknowledgements

Built as a learning project exploring full-stack web development, authentication, database integration, and AI-powered applications.