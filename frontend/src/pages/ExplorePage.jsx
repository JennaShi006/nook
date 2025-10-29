import React from "react";
import "../style/ExplorePage.css";
import ListingCard from "../components/ListingCard";
import { useState, useEffect } from "react";

function ExplorePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paddingTop, setPaddingTop] = useState(0);

  useEffect(() => {
    const header = document.querySelector(".header");
    if (header) {
      const updatePadding = () => setPaddingTop(header.offsetHeight);
      updatePadding(); // run once
      window.addEventListener("resize", updatePadding);
      return () => window.removeEventListener("resize", updatePadding);
    }
  }, []);

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

if (loading) return <div className="explore-page" style={{ paddingTop: paddingTop }}>Loading listings...</div>;
if (error) return <div className="explore-page" style={{ paddingTop: paddingTop }}>{error}</div>;
if (listings.length === 0)
  return <div className="explore-page" style={{ paddingTop: paddingTop }}>No listings available.</div>;

  return <div className ="explore-page" style={{ paddingTop: paddingTop }}>
    <div className = "listing-grid">
      {listings ? listings.map((listing) => (
        <ListingCard 
          key={listing._id}
          title={listing.title}
          description={listing.description}
          price={listing.price}
          seller={listing.seller}
        />
      )) : null}
    </div>
  </div>;
}
export default ExplorePage;