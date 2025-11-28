import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getCurrentUser } from "../utils/auth";
import ConversationsList from "../components/ConversationsList";

const PORT = process.env.REACT_APP_PORT || 5000;

// Connect to backend
const socket = io(`http://localhost:${PORT}`, {
  transports: ["websocket"], // ensures stable connection
});

function ChatPage() {
  const [receiverId, setReceiverId] = useState(""); // ID of person you're chatting with
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const user = getCurrentUser(); // pull logged-in user from localStorage

  // Join personal room ONCE when component mounts
  useEffect(() => {
    if (user?._id) socket.emit("join", user._id);
  }, []); // ← only once, avoids “joined room” spam

  // Load chat history whenever receiverId changes
  useEffect(() => {
    if (!receiverId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:${PORT}/api/messages/${user._id}/${receiverId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    fetchMessages();
  }, [receiverId]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      // ignore self-echo
      if (!data || data.senderId === user._id) return;
      if (
        (data.senderId === receiverId && data.receiverId === user._id) ||
        (data.receiverId === receiverId && data.senderId === user._id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => socket.off("receive_message");
  }, [receiverId, user]);

  // Send message via Socket.io
  const sendMessage = async () => {
    if (!message.trim() || !receiverId) return;

    const msgData = {
      senderId: user._id,
      receiverId: receiverId,
      content: message,
    };

    try {
      // 1 Save to DB
      const res = await fetch(`http://localhost:${PORT}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 2 Also send via Socket.io (if connected)
      socket.emit("send_message", data.newMessage);

      // 3 Update UI immediately
      setMessages((prev) => [...prev, data.newMessage]);
      setMessage("");
      setRefreshSidebar((prev) => prev + 1);
    } catch (err) {
      console.error("Message send error:", err);
      alert("Failed to send message. Try again.");
    }
  };

  return (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      height: "calc(100vh - 100px)", // full height minus header
      marginTop: "100px", // keep under header
      backgroundColor: "#fafafa",
    }}
  >
    {/* Sidebar */}
    <div
      style={{
        flex: "0 0 260px", // fixed width for sidebar
        borderRight: "1px solid #ddd",
        backgroundColor: "#fff",
        overflowY: "auto",
      }}
    >
      <ConversationsList
        onSelectConversation={(id) => setReceiverId(id)}
        refreshTrigger={refreshSidebar}
      />
    </div>

    {/* Chat area */}
    <div
      style={{
        flex: 1, // fill remaining space
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        minWidth: 0, // prevents overflow on narrow screens
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Direct Message</h2>

      {receiverId ? (
        <>
          {/* Message history */}
          <div
            style={{
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "1rem",
              overflowY: "auto",
              backgroundColor: "#fff",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign: msg.senderId === user._id ? "right" : "left",
                  margin: "8px 0",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: "16px",
                    backgroundColor:
                      msg.senderId === user._id ? "#a3d8ff" : "#ffe9ce",
                    wordWrap: "break-word",
                    maxWidth: "70%",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div
            style={{
              display: "flex",
              marginTop: "1rem",
              gap: "10px",
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "10px 20px",
                backgroundColor: "#a3d8ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <p>Select a conversation from the sidebar to start chatting.</p>
        </div>
      )}
    </div>
  </div>
);
}

export default ChatPage;