import { useState } from "react";

export default function SummaryCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(item.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="history-item">
      <div className="history-item-header">
        <span className="history-date">{date}</span>
        <button className="btn-danger-text" onClick={() => onDelete(item._id)}>
          Delete
        </button>
      </div>

      <div className="history-summary">{item.summary}</div>

      <button className="history-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide original text ▲" : "View original text ▼"}
      </button>

      {expanded && (
        <div className="history-original">
          <span className="history-original-label">Original</span>
          {item.originalText}
        </div>
      )}
    </div>
  );
}
