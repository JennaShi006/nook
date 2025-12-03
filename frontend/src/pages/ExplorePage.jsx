import React from "react";
import "../style/ExplorePage.css";
import ListingCard from "../components/ListingCard";
import FilterSearch from "../components/FilterSearch";
import { useState, useEffect } from "react";

// Prefer an explicit API URL; fall back to localhost and a safe default port (5001)
// to avoid colliding with macOS services that sometimes bind to 5000.
const API_BASE = process.env.REACT_APP_API_URL || `http://localhost:${process.env.REACT_APP_PORT || 5001}`;
function ExplorePage() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
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
  const fetchListings = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(params);
      const res = await fetch(`${API_BASE}/api/listings?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      const data = await res.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(filters);
  }, [filters]);


  if (loading) return <div className="explore-page" style={{ paddingTop: paddingTop }}>Loading listings...</div>;
  if (error) return <div className="explore-page" style={{ paddingTop: paddingTop }}>Error: {error}</div>;

  return (
    <div className="explore-page" style={{ paddingTop: paddingTop }}>
      <FilterSearch onFilterChange={setFilters} />
      <div className="listing-grid">
        {listings.length === 0 ? (
          <p>No listings found.</p>
        ) : (
          listings.map((listing) => (
            <ListingCard
              key={listing._id}
              title={listing.title}
              description={listing.description}
              picture={listing.picture}
              price={listing.price}
              seller={listing.seller}
              listingId={listing._id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExplorePage;