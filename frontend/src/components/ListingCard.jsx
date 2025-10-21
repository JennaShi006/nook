import { useEffect , useState} from "react"
import "../style/ListingCard.css"

export default function ListingCard({ title, description, price , picture, seller}) {
    const [sellerName, setSellerName] = useState(null);
    useEffect(() => {
        if (!seller) return;
        fetch(`http://localhost:5001/api/users/${seller}`)
        .then((res) => res.json())
        .then((data) => {
            console.log("Fetched seller:", data)
            setSellerName(data.name)
        })
        .catch((err) => {
            console.error("Error fetching seller:", err)
        })
    }, [seller]);
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
        </div>
    )
};