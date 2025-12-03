import { useEffect, useState } from "react";
import "../style/ListingReviews.css";
import { getCurrentUser } from "../utils/auth";

const PORT = process.env.REACT_APP_PORT || 5000;

export default function ListingReviews({ listingId, onClose, updateListingAverages }) {

  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [avgRating, setAvgRating] = useState(null);


  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
  try {
    const res = await fetch(`http://localhost:${PORT}/api/reviews/${listingId}`);
    const data = await res.json();

    console.log("REVIEW RESPONSE:", data); // TEMP DEBUG

    setReviews(data.reviews);
    setAvgRating(data.avgRating);
  } catch (err) {
    console.error(err);
  }
};


  const handleAddReview = async () => {
  if (!currentUser) return alert("Please log in.");

  try {
    const res = await fetch(`http://localhost:${PORT}/api/reviews/${listingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewerId: currentUser._id,
        rating: newRating,
        comment: newComment,
      }),
    });

    const data = await res.json();
    const newReview = data.review;

    setReviews((prev) => [newReview, ...prev]);

    setAvgRating(data.listingAvgRating);

    if (updateListingAverages) {
      updateListingAverages(data.listingAvgRating, data.listingNumReviews);
    }

    setNewRating(5);
    setNewComment("");
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="modal-overlay" onClick={onClose}>

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>

       <h3 style={{ textAlign: "center" }}>Reviews</h3>
      {typeof avgRating === "number" && !isNaN(avgRating) && (
  <p style={{ textAlign: "center", fontWeight: "bold" }}>
    Average Rating: {avgRating.toFixed(1)}/5 ⭐
  </p>
)}


        <div className="add-review fixed-add-review">
          <h4>Add Review</h4>

          <input
            type="number"
            min="1"
            max="5"
            value={newRating}
            onChange={(e) => setNewRating(e.target.value)}
          />

          <textarea
            placeholder="Comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <button onClick={handleAddReview}>Submit</button>
        </div>

        <div className="reviews-scroll-container">
          {reviews.length ? (
            reviews.map((r) => (
              <div key={r._id} className="review">
                <strong>{r.reviewer?.name}</strong> (@{r.reviewer?.username}) — {r.rating}/5
                <p>{r.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}