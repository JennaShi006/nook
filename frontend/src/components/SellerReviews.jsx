import { useEffect, useState } from "react";
import "../style/SellerReviews.css";

export default function SellerReviews({ sellerId, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);

  const PORT = process.env.REACT_APP_PORT || 5000;

  useEffect(() => {
  if (!sellerId) return;

  fetch(`http://localhost:${PORT}/api/reviews/seller/${sellerId}`)
    .then((res) => res.json())
    .then((data) => {
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
    })
    .catch((err) => console.error(err));
}, [sellerId]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Seller Reviews</h2>

        {avgRating !== null && (
        <p style={{ textAlign: "center", fontWeight: "bold" }}>
            Average Rating: {avgRating.toFixed(1)}/5 ⭐
        </p>
        )}

        {reviews.length ? (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r._id} className="review">
                <strong>{r.reviewer.name}</strong> (@{r.reviewer.username}) — {r.rating}/5
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
}