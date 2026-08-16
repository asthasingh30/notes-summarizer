import { useState } from "react";
import api from "../api/axios.js";

const MAX_LENGTH = 20000;

export default function Summarizer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!text.trim()) {
      setError("Paste some notes or a textbook paragraph first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data } = await api.post("/summarise", { text });
      setResult(data);
      setText("");
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("Can't reach the server. Is the backend running?");
      } else {
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="eyebrow">New summary</div>
      <h1>
        Turn your notes into a <span className="hl">clear summary</span>
      </h1>
      <p className="subtitle">
        Paste your class notes or a textbook paragraph below. Every summary you generate is saved
        to your account automatically.
      </p>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="notes">Your notes</label>
            <textarea
              id="notes"
              placeholder="Paste your notes or textbook paragraph here..."
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
              disabled={loading}
            />
            <div className="char-count">
              {text.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
            {loading ? (
              <>
                <span className="spinner" /> Summarising...
              </>
            ) : (
              "Summarise"
            )}
          </button>
        </form>

        {result && (
          <div className="summary-result">
            <div className="eyebrow">Summary</div>
            <div className="summary-result-text">{result.summary}</div>
          </div>
        )}
      </div>
    </div>
  );
}
