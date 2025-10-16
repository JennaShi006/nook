import React from "react";
import "./Header.css";
import userIcon from "../graphics/account_icon.png";
import { Link } from "react-router-dom";

function Header() {

    /* Learn More directs to our repo! */
    const handleLearnMoreClick = () => {
        window.open("https://github.com/JennaShi006/nook", "_blank");
    };
    
    return (
        <header className="header">
            <div className="header-container">
                {/* logo */}
                <div className="logo">Nook</div>

                {/* nav links */}
                <nav className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/explore">Explore</Link>
                    <Link to="/chat">Chat</Link>
                    <button className="learn-more" onClick={handleLearnMoreClick}>
                        Learn More ↗
                    </button>
                </nav>

                {/* Account icon */}
                <Link to="/login" className="account-icon" title="Login / Sign Up">
                        <img src={userIcon} alt="User Account" className="user-img" />
                </Link>
            </div>
        </header>
  );
}

export default Header;
