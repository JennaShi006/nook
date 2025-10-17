import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";

function ConversationsList({ onSelectConversation, refreshTrigger}) {
  const [partners, setPartners] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // track which chat is active
  const user = getCurrentUser();

  useEffect(() => {
    if (!user?._id) return;

    fetch(`http://localhost:5000/api/conversations/${user._id}`)
      .then((res) => res.json())
      .then((data) => setPartners(data))
      .catch((err) => console.error("Error loading conversations:", err));
  }, [user, refreshTrigger]);

  const handleSelect = (partnerId) => {
    setActiveChat(partnerId); // highlight selection
    onSelectConversation(partnerId); // notify parent
  };

  return (
    <div
      style={{
        width: "250px",
        borderRight: "1px solid #ccc",
        height: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: "1rem",
        position: "fixed",
        top: "100px",
        left: 0,
        backgroundColor: "#fdfdfd",
      }}
    >
      <h3 style={{ marginBottom: "1rem" }}>Chats</h3>
      {partners.length === 0 ? (
        <p>No conversations yet</p>
      ) : (
        partners.map((p) => (
          <div
            key={p._id}
            onClick={() => handleSelect(p._id)}
            style={{
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor:
                p._id === activeChat ? "#a3d8ff" : "#f0f8ff", // ✅ blue highlight if active
              color: p._id === activeChat ? "white" : "black", // contrast text
              transition: "background-color 0.2s ease, color 0.2s ease",
            }}
          >
            <strong>{p.name}</strong>
            <div style={{ fontSize: "12px", color: p._id === activeChat ? "#eef" : "#555" }}>
              @{p.username}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ConversationsList;