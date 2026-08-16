import { useEffect, useState } from "react";
import api from "../api/axios.js";
import SummaryCard from "../components/SummaryCard.jsx";

export default function MySummaries() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/summaries");
      setSummaries(data);
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("Can't reach the server. Is the backend running?");
      } else {
        setError(err.response?.data?.message || "Couldn't load your summaries.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const prev = summaries;
    setSummaries(summaries.filter((s) => s._id !== id)); // optimistic update
    try {
      await api.delete(`/summaries/${id}`);
    } catch (err) {
      setSummaries(prev); // roll back on failure
      setError("Couldn't delete that summary. Please try again.");
    }
  };

  return (
    <div className="page-container">
      <div className="eyebrow">Your history</div>
      <h1>
        My <span className="hl">summaries</span>
      </h1>
      <p className="subtitle">Every summary you've generated, saved to your account.</p>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="page-loading">Loading your summaries...</div>
      ) : summaries.length === 0 ? (
        <div className="card empty-state">
          <h3>No summaries yet</h3>
          <p>Head to the Summarise page and paste in your first set of notes.</p>
        </div>
      ) : (
        summaries.map((item) => (
          <SummaryCard key={item._id} item={item} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}
