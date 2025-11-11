import "../style/CreateListing.css";
import { getCurrentUser } from "../utils/auth";
import {useEffect, useState} from "react";

const PORT = process.env.REACT_APP_PORT || 5000;

export default function CreateListing() {
    const [paddingTop, setPaddingTop] = useState(0);
    const currentUser = getCurrentUser();
    if (currentUser) {
        console.log("Current user in CreateListing:", currentUser);
    }
    const [form, setForm] = useState({
        title: "", 
        description: "",
        price: "",
        picture: "",
        seller: null
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        try{
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            fetch(`http://localhost:${PORT}/api/image-upload`, {
                method: "POST",
                body: formData,
            })
            .then((res) => res.json())
            .then((data) => {
                console.log("Image URL:", data.url)
                setForm({...form, picture: data.url})
            })
        } catch (err) {
            console.error("Image upload error:", err);
        }
        
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const listingData = { ...form, seller: currentUser._id };
        console.log("Listing data being sent:", listingData);

        try {
            const response = await fetch(`http://localhost:${PORT}/api/listings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(listingData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Show error if backend returns 400 or 500
                alert(`Creation failed: ${data.error || "Please fill all required fields correctly."}`);
                console.error("Creation error:", data);
                return;
            }

            console.log("Listing Created:", data);
            alert("Item created! Check console for response.");
        } catch (err) {
            console.error("Error:", err);
            alert("Network or server error. Please try again.");
        }
    };
    
    useEffect(() => {
        const header = document.querySelector(".header");
        if (header) {
          const updatePadding = () => setPaddingTop(header.offsetHeight);
          updatePadding(); // run once
          window.addEventListener("resize", updatePadding);
          return () => window.removeEventListener("resize", updatePadding);
        }
      }, []);


    return (
        <div className="create-listing-page" style={{ paddingTop: paddingTop }}>
            <h2>Create Listing</h2>
            <form onSubmit={handleSubmit} className="listing-form">
                <input name="title" placeholder="title" onChange={handleChange} required /><br/>
                <input name="description" placeholder="description" onChange={handleChange}/><br/>
                <input name="price" placeholder="$0.00" onChange={handleChange} required/><br/>
                <input 
                    type="file"
                    accept="image/*"
                    name="picture"
                    multiple={false}
                    onChange={handleImageUpload} /><br/>
                <button className="listing-creation-button"type="submit">Create Listing</button>
            </form>
        </div>
    )
}