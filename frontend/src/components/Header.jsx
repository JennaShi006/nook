import "../style/Header.css";
import userIcon from "../graphics/account_icon.png";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/auth";

function Header() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    console.log("Current user in Header:", user);

    /* Learn More directs to our repo! */
    const handleLearnMoreClick = () => {
        window.open("https://github.com/JennaShi006/nook", "_blank");
    };

    const handleAccountClick = () => {
        if (user) {
            navigate("/account");
        } else {
            navigate("/login");
        }
    };

    const handleCreateListing = () => {
        if (user) {
            navigate("/create-listing");
        } else {
            navigate("/login");
        }
    };

    const handleChatClick = () => {
        if (user) {
            navigate("/chat");
        } else {
            navigate("/login");
        }
    };

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
        window.location.reload(); // Refresh to update header state
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
                    
                    {/* Chat link - only show if logged in */}
                    {user && <Link to="/chat">Chat</Link>}
                    
                    {/* Create Listing button */}
                    <button 
                        className="create-listing-button" 
                        onClick={handleCreateListing}
                    >
                        {user ? "Create Listing +" : "Login to Sell +"}
                    </button>
                    
                    <button className="learn-more" onClick={handleLearnMoreClick}>
                        Learn More ↗
                    </button>
                    
                    {/* Logout button (only when logged in) */}
                    {user && (
                        <button 
                            className="logout-button"
                            onClick={handleLogout}
                            style={{
                                marginLeft: '10px',
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    )}
                </nav>

                {/* Account icon */}
                <div className="account-icon" onClick={handleAccountClick}>
                    <img src={userIcon} alt="User Account" className="user-img" />
                    {/* Show user status indicator */}
                    {user && (
                        <div className="user-status">
                            {user.verified ? (
                                <span className="verified-badge" title="Verified">
                                    ✓
                                </span>
                            ) : (
                                <span className="unverified-badge" title="Not Verified">
                                    ⚠
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;