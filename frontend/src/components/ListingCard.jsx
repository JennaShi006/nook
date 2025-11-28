import { useEffect , useState} from "react"
import "../style/ListingCard.css"
import { getCurrentUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import SellerReviews from "./SellerReviews";
const PORT = process.env.REACT_APP_PORT || 5000;

export default function ListingCard({ title, description, price , picture, seller, listingId}) {
    const [sellerName, setSellerName] = useState(null);
    const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const [showModal, setShowModal] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState(null);

  const handleSellerClick = (sellerId) => {
    setSelectedSellerId(sellerId);
    setShowModal(true);
  };

    useEffect(() => {
        if (!seller) return;
        fetch(`http://localhost:${PORT}/api/users/${seller}`)
        .then((res) => res.json())
        .then((data) => {
            console.log("Fetched seller:", data)
            setSellerName(data.name)
        })
        .catch((err) => {
            console.error("Error fetching seller:", err)
        })
    }, [seller]);

    const handleMessageSeller = async () => {
    if (!currentUser) {
      alert("Please log in to send a message.");
      navigate("/login");
      return;
    }

    const content = prompt(`Send a message to ${sellerName}:`);
    if (!content) return;

    try {
        const res = await fetch(`http://localhost:${PORT}/api/messages/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                senderId: currentUser._id,
                receiverId: seller,
                content,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Failed to send message");
        }

        alert(`Message sent to ${sellerName}!`);
        navigate("/chat");
        } catch (err) {
        console.error("Error sending message:", err);
        alert("Failed to send message.");
        }
    };
      const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/reviews/${listingId}`);
      const data = await res.json();
      setReviews(data);
      setShowReviews(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReview = async () => {
    if (!currentUser) {
      alert("Please log in to add a review.");
      return;
    }
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
      setReviews([data, ...reviews]); // add new review to top
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      console.error(err);
    }
  };

    return(
        <div className ="listing-card">
            <img className ="listing-image" src = {picture ? picture : "../logo512.png"} alt={title} />
            <div className="listing-details">
                <div className="listing-text">
                    <h3 className="listing-title">{title}</h3>
                    <p className="listing-description">{description}</p>
                    <p className="listing-seller"  style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            onClick={handleSellerClick}>{sellerName}</p>
                         {showModal && (
                    <SellerReviews
                    sellerId={seller}
                    onClose={() => setShowModal(false)}
                    />
                )}
                </div>
                <p className="listing-price">${price}</p>
            </div>
            <button className="message-btn" onClick={handleMessageSeller}>
                Message Seller
            </button>
        <button className="reviews-btn" onClick={fetchReviews}>View Reviews</button>

      {showReviews && (
        <div className="reviews-popup">
          <button className="close-btn" onClick={() => setShowReviews(false)}>X</button>
          <h3>Reviews</h3>
          <div className="reviews-list">
            {reviews.length ? (
              reviews.map((r) => (
                <div key={r._id} className="review">
                  <strong>{r.reviewer.name}</strong> — {r.rating}/5
                  <p>{r.comment}</p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
          <div className="add-review">
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
        </div>
      )}
    </div>
  );
}