import React, { useState } from "react";
import "../../styles.css";
export default function ReviewSection({ movieId, reviews = [], onReviewAdded }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    const token = sessionStorage.getItem('sessionToken');
    const res = await fetch(`http://localhost:5000/api/movies/${movieId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ text, rating })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Review submitted!");
      setText("");
      setRating(5);
      if (onReviewAdded) onReviewAdded();
    } else {
      setMessage(data.message || "Error submitting review.");
    }
    setSubmitting(false);
  };

  return (
    <div className="review-section">
      <h3>Reviews</h3>
      {(!reviews || reviews.length === 0) && <p>No reviews yet.</p>}
      <ul className="review-list">
        {reviews && reviews.map((r, i) => (
          <li key={i}>
            <strong>{r.user?.username || "User"}:</strong> {r.text} <em>({new Date(r.date).toLocaleString()})</em>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write your review..."
          required
        />
        <br />
        <label className="rating-label">
          Rating:
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            className="rating-input"
            onChange={e => setRating(Number(e.target.value))}
            required
          />
        </label>
       
        <button type="submit" disabled={submitting}>Submit Review</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}