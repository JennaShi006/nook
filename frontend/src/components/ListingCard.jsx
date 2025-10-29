import { useEffect , useState} from "react"
import "../style/ListingCard.css"
import { getCurrentUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function ListingCard({ title, description, price , picture, seller}) {
    const [sellerName, setSellerName] = useState(null);
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    useEffect(() => {
        if (!seller) return;
        fetch(`http://localhost:5000/api/users/${seller}`)
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
        const res = await fetch("http://localhost:5000/api/messages/send", {
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

    return(
        <div className ="listing-card">
            <img className ="listing-image" src = {picture ? picture : "../logo512.png"} alt={title} />
            <div className="listing-details">
                <div className="listing-text">
                    <h3 className="listing-title">{title}</h3>
                    <p className="listing-description">{description}</p>
                    <p className="listing-seller">{sellerName}</p>
                </div>
                <p className="listing-price">${price}</p>
            </div>
            <button className="message-btn" onClick={handleMessageSeller}>
                Message Seller
            </button>
        </div>
    );
}