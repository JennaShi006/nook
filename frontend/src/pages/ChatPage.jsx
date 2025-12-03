import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getCurrentUser, getToken } from "../utils/auth";
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

// import { useEffect, useState, useRef } from "react"; // Removed useCallback
// import { io } from "socket.io-client";
// import { getCurrentUser, getToken } from "../utils/auth";
// import ConversationsList from "../components/ConversationsList";

// const PORT = process.env.REACT_APP_PORT || 5000;

// function ChatPage() {
//   const [receiverId, setReceiverId] = useState("");
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [refreshSidebar, setRefreshSidebar] = useState(0);
//   const [isConnected, setIsConnected] = useState(false);
//   const user = getCurrentUser();
  
//   // Use refs to prevent recreations
//   const socketRef = useRef(null);
//   const messagesRef = useRef([]);
//   const isInitialized = useRef(false);

//   // Initialize socket ONCE
//   useEffect(() => {
//     if (!user?._id || isInitialized.current) return;
    
//     const token = getToken();
//     const newSocket = io(`http://localhost:${PORT}`, {
//       transports: ["websocket"],
//       auth: { token },
//       query: { userId: user._id },
//       reconnection: true,
//       reconnectionAttempts: 3,
//       reconnectionDelay: 1000,
//     });

//     newSocket.on("connect", () => {
//       console.log("Socket connected:", newSocket.id);
//       setIsConnected(true);
//       newSocket.emit("join", user._id);
//     });

//     newSocket.on("disconnect", () => {
//       console.log("Socket disconnected");
//       setIsConnected(false);
//     });

//     newSocket.on("connect_error", (err) => {
//       console.error("Socket connection error:", err.message);
//     });

//     socketRef.current = newSocket;
//     isInitialized.current = true;

//     // Cleanup
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current = null;
//         isInitialized.current = false;
//       }
//     };
//   }, [user]);

//   // Listen for incoming messages
//   useEffect(() => {
//     const socket = socketRef.current;
//     if (!socket || !user?._id) return;

//     const handleReceiveMessage = (data) => {
//       if (!data || data.senderId === user._id) return;
      
//       // Update ref first
//       messagesRef.current = [...messagesRef.current, data];
      
//       // Then update state if it's for current conversation
//       if (receiverId && 
//           (data.senderId === receiverId || data.receiverId === receiverId)) {
//         setMessages(prev => [...prev, data]);
//       }
      
//       // Trigger sidebar refresh
//       setRefreshSidebar(prev => prev + 1);
//     };

//     socket.on("receive_message", handleReceiveMessage);

//     return () => {
//       socket.off("receive_message", handleReceiveMessage);
//     };
//   }, [receiverId, user]);

//   // Load chat history
//   useEffect(() => {
//     if (!receiverId || !user?._id) {
//       setMessages([]);
//       messagesRef.current = [];
//       return;
//     }

//     const fetchMessages = async () => {
//       try {
//         const token = getToken();
//         const res = await fetch(
//           `http://localhost:${PORT}/api/messages/${user._id}/${receiverId}?limit=100`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const data = await res.json();
//         setMessages(data || []);
//         messagesRef.current = data || [];
//       } catch (err) {
//         console.error("Error loading messages:", err);
//         setMessages([]);
//         messagesRef.current = [];
//       }
//     };

//     fetchMessages();
//   }, [receiverId, user]);

//   // Send message
//   const sendMessage = async () => {
//     if (!message.trim() || !receiverId || !user?._id) return;

//     const msgData = {
//       senderId: user._id,
//       receiverId: receiverId,
//       content: message,
//     };

//     try {
//       const token = getToken();
//       const res = await fetch(`http://localhost:${PORT}/api/messages/send`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(msgData),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to send message");
//       }

//       const data = await res.json();
      
//       // Update UI immediately
//       setMessages(prev => [...prev, data.newMessage]);
//       messagesRef.current = [...messagesRef.current, data.newMessage];
//       setMessage("");
      
//       // Send via socket if connected
//       if (socketRef.current && isConnected) {
//         socketRef.current.emit("send_message", data.newMessage);
//       }
      
//       setRefreshSidebar(prev => prev + 1);
      
//     } catch (err) {
//       console.error("Message send error:", err);
//       alert(err.message || "Failed to send message");
//     }
//   };

//   // Handle Enter key
//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   // Cleanup messages when component unmounts
//   useEffect(() => {
//     return () => {
//       setMessages([]);
//       messagesRef.current = [];
//     };
//   }, []);

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "row",
//         height: "calc(100vh - 100px)",
//         marginTop: "100px",
//         backgroundColor: "#fafafa",
//       }}
//     >
//       {/* Sidebar - limit height */}
//       <div
//         style={{
//           flex: "0 0 260px",
//           borderRight: "1px solid #ddd",
//           backgroundColor: "#fff",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <div style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
//           <h3 style={{ margin: 0 }}>Messages</h3>
//           <div style={{ fontSize: "0.8rem", color: isConnected ? "#4CAF50" : "#ff9800" }}>
//             {isConnected ? "● Connected" : "● Connecting..."}
//           </div>
//         </div>
//         <div style={{ flex: 1, overflowY: "auto" }}>
//           <ConversationsList
//             onSelectConversation={(id) => setReceiverId(id)}
//             refreshTrigger={refreshSidebar}
//           />
//         </div>
//       </div>

//       {/* Chat area */}
//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           flexDirection: "column",
//           padding: "2rem",
//           minWidth: 0,
//           overflow: "hidden",
//         }}
//       >
//         <h2 style={{ marginBottom: "1rem" }}>
//           {receiverId ? "Direct Message" : "Chat"}
//         </h2>

//         {receiverId ? (
//           <>
//             {/* Message history with virtualization */}
//             <div
//               style={{
//                 flex: 1,
//                 border: "1px solid #ccc",
//                 borderRadius: "10px",
//                 padding: "1rem",
//                 overflowY: "auto",
//                 backgroundColor: "#fff",
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               {messages.slice(-100).map((msg, i) => ( // Only show last 100 messages
//                 <div
//                   key={msg._id || i}
//                   style={{
//                     alignSelf: msg.senderId === user?._id ? "flex-end" : "flex-start",
//                     margin: "8px 0",
//                     maxWidth: "70%",
//                   }}
//                 >
//                   <div
//                     style={{
//                       padding: "8px 12px",
//                       borderRadius: "16px",
//                       backgroundColor: msg.senderId === user?._id ? "#a3d8ff" : "#ffe9ce",
//                       wordWrap: "break-word",
//                       boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
//                     }}
//                   >
//                     {msg.content}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "0.7rem",
//                       color: "#666",
//                       marginTop: "2px",
//                       textAlign: msg.senderId === user?._id ? "right" : "left",
//                     }}
//                   >
//                     {msg.createdAt
//                       ? new Date(msg.createdAt).toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })
//                       : ""}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Message input */}
//             <div
//               style={{
//                 display: "flex",
//                 marginTop: "1rem",
//                 gap: "10px",
//                 alignItems: "center",
//               }}
//             >
//               <input
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Type a message..."
//                 style={{
//                   flex: 1,
//                   padding: "12px 16px",
//                   borderRadius: "24px",
//                   border: "1px solid #ccc",
//                   fontSize: "1rem",
//                   outline: "none",
//                 }}
//               />
//               <button
//                 onClick={sendMessage}
//                 disabled={!message.trim() || !isConnected}
//                 style={{
//                   padding: "12px 24px",
//                   backgroundColor: !message.trim() || !isConnected ? "#ccc" : "#a3d8ff",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "24px",
//                   cursor: !message.trim() || !isConnected ? "not-allowed" : "pointer",
//                   fontWeight: "bold",
//                   fontSize: "1rem",
//                 }}
//               >
//                 Send
//               </button>
//             </div>
//           </>
//         ) : (
//           <div
//             style={{
//               flex: 1,
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#666",
//             }}
//           >
//             <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💬</div>
//             <h3>Welcome to Chat</h3>
//             <p>Select a conversation from the sidebar to start chatting.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ChatPage;