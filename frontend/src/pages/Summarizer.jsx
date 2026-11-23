
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
      setError("Paste some notes first.");
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
        setError(
          err.response?.data?.message ||
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card summarizer-card">

        <div className="summarizer-heading">
          <h1>Turn your notes into a clear summary</h1>
          <p className="subtitle">
            Paste your study material below and click summarise.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="notes">Your notes</label>

            <textarea
              id="notes"
              placeholder="Enter your notes here..."
              value={text}
              onChange={(e) =>
                setText(e.target.value.slice(0, MAX_LENGTH))
              }
              disabled={loading}
              maxLength={MAX_LENGTH}
            />

            <div className="char-count">
              {text.length.toLocaleString()} / 20,000
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Summarising...
              </>
            ) : (
              "Summarise"
            )}
          </button>
        </form>

        <div className="summary-result">
          <h2>Summary</h2>

          <div className="summary-result-text">
            {result?.summary || ""}
          </div>
        </div>

      </div>
    </div>
  );
}
