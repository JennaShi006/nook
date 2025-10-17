import React from "react";
import "../style/ExplorePage.css";
import ListingCard from "../components/ListingCard";
import { useState, useEffect } from "react";

function ExplorePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetching listing data
  useEffect(() => {
    fetch("http://localhost:5000/api/listings")
    .then((res) => res.json())
    .then((data) => {
      console.log("Fetched listings:", data); // 👈 check structure
      setListings(data);
    })
    .catch((err) => {
        console.error("Error fetching listings:", err);
        setError("Failed to load listings.");
      })
    .finally(() => setLoading(false));
}, []);

if (loading) return <div className="explore-page">Loading listings...</div>;
if (error) return <div className="explore-page">{error}</div>;
if (listings.length === 0)
  return <div className="explore-page">No listings available.</div>;

  return <div className ="explore-page">
    {listings ? listings.map((listing) => (
      <ListingCard 
        key={listing._id}
        title={listing.title}
        description={listing.description}
        price={listing.price}
        seller={listing.seller}
      />
    )) : null}
  </div>;
}
export default ExplorePage;