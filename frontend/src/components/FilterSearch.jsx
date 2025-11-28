import { useState } from "react";
import "../style/FilterSearch.css";

export default function FilterSearch({ onFilterChange }) {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      search,
      minPrice,
      maxPrice,
      startDate,
      endDate,
    });
  };

  const handleReset = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setStartDate("");
    setEndDate("");
    onFilterChange({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <input
        type="text"
        placeholder="Search listings"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <input
        type="number"
        placeholder="Min Price"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
      />
      <input
        type="number"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <button type="submit">Apply Filters</button>
      <button type="button" onClick={handleReset}>
        Reset
      </button>
    </form>
  );
}