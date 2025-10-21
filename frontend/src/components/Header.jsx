import "../style/Header.css";
import userIcon from "../graphics/account_icon.png";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

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
        }   else {
        navigate("/login");
        }
    };

    const handleCreateListing = () => {
        if (user) {
            navigate("/create-listing");
        }   else {
            navigate("/login");
        }
    }
    
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
                    <button className="create-listing-button" onClick={handleCreateListing}>Create Listing +</button>
                    <button className="learn-more" onClick={handleLearnMoreClick}>
                        Learn More ↗
                    </button>
                </nav>

                {/* Account icon */}
                {/* <Link to="/login" className="account-icon" title="Login / Sign Up">
                        <img src={userIcon} alt="User Account" className="user-img" />
                </Link> */}
                <Link to="/account" className="account-icon" onClick={handleAccountClick}>
                        <img src={userIcon} alt="User Account" className="user-img" />
                </Link>
            </div>
        </header>
  );
}

export default Header;
