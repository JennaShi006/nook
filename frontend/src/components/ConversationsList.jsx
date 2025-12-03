import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";

const PORT = process.env.REACT_APP_PORT || 5000;

function ConversationsList({ onSelectConversation, refreshTrigger}) {
  const [partners, setPartners] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // track which chat is active
  const user = getCurrentUser();

  useEffect(() => {
    if (!user?._id) return;

    fetch(`http://localhost:${PORT}/api/conversations/${user._id}`)
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

// import { useEffect, useState, useCallback, useRef } from "react";
// import { getCurrentUser, getToken } from "../utils/auth";

// const PORT = process.env.REACT_APP_PORT || 5000;

// function ConversationsList({ onSelectConversation, refreshTrigger }) {
//   const [partners, setPartners] = useState([]);
//   const [activeChat, setActiveChat] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const user = getCurrentUser();
//   const isFetching = useRef(false);
//   const abortController = useRef(null);

//   const fetchConversations = useCallback(async () => {
//     if (!user?._id || isFetching.current) return;
    
//     isFetching.current = true;
    
//     // Abort any previous request
//     if (abortController.current) {
//       abortController.current.abort();
//     }
//     abortController.current = new AbortController();

//     try {
//       setLoading(true);
//       const token = getToken();
      
//       const response = await fetch(
//         `http://localhost:${PORT}/api/conversations/${user._id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           },
//           signal: abortController.current.signal
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to fetch conversations: ${response.status}`);
//       }

//       const data = await response.json();
//       setPartners(Array.isArray(data) ? data : []);
//       setError("");
//     } catch (err) {
//       if (err.name === 'AbortError') {
//         console.log('Fetch aborted');
//         return;
//       }
//       console.error("Error loading conversations:", err);
//       setError("Failed to load conversations. Please try again.");
//     } finally {
//       setLoading(false);
//       isFetching.current = false;
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchConversations();
    
//     // Cleanup function
//     return () => {
//       if (abortController.current) {
//         abortController.current.abort();
//       }
//     };
//   }, [fetchConversations, refreshTrigger]);

//   const handleSelect = useCallback((partnerId) => {
//     setActiveChat(partnerId);
//     onSelectConversation(partnerId);
//   }, [onSelectConversation]);

//   // Memoize the partner list to prevent unnecessary re-renders
//   const memoizedPartners = useRef([]);
//   useEffect(() => {
//     memoizedPartners.current = partners;
//   }, [partners]);

//   // Limit the number of partners displayed
//   const displayPartners = memoizedPartners.current.slice(0, 50);

//   if (!user?._id) {
//     return (
//       <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
//         Please log in to view conversations
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "100%",
//         overflowY: "auto",
//         backgroundColor: "#fff",
//       }}
//     >
//       <div style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
//         <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#333" }}>
//           Messages
//         </h3>
//         <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", color: "#666" }}>
//           {displayPartners.length} conversation{displayPartners.length !== 1 ? 's' : ''}
//         </p>
//       </div>

//       {loading ? (
//         <div style={{ padding: "2rem", textAlign: "center" }}>
//           <div style={{ color: "#666" }}>Loading conversations...</div>
//         </div>
//       ) : error ? (
//         <div style={{ padding: "2rem", textAlign: "center", color: "#ff4444" }}>
//           {error}
//         </div>
//       ) : displayPartners.length === 0 ? (
//         <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
//           <p>No conversations yet</p>
//           <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
//             Start a conversation from a listing!
//           </p>
//         </div>
//       ) : (
//         <div style={{ padding: "0.5rem" }}>
//           {displayPartners.map((partner) => (
//             <div
//               key={partner._id}
//               onClick={() => handleSelect(partner._id)}
//               style={{
//                 padding: "0.75rem 1rem",
//                 marginBottom: "0.25rem",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 backgroundColor: partner._id === activeChat ? "#e3f2fd" : "transparent",
//                 borderLeft: partner._id === activeChat ? "4px solid #1976d2" : "4px solid transparent",
//                 transition: "all 0.2s ease",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "12px",
//                 ...(partner._id === activeChat ? {} : {
//                   ':hover': {
//                     backgroundColor: '#f5f5f5',
//                   }
//                 })
//               }}
//             >
//               <div
//                 style={{
//                   width: "40px",
//                   height: "40px",
//                   borderRadius: "50%",
//                   backgroundColor: partner._id === activeChat ? "#1976d2" : "#a3d8ff",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   color: "white",
//                   fontWeight: "bold",
//                   fontSize: "1rem",
//                   flexShrink: 0,
//                 }}
//               >
//                 {partner.name?.charAt(0).toUpperCase() || partner.username?.charAt(0).toUpperCase() || "?"}
//               </div>
              
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div
//                   style={{
//                     fontWeight: "600",
//                     fontSize: "0.95rem",
//                     color: partner._id === activeChat ? "#1976d2" : "#333",
//                     marginBottom: "2px",
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {partner.name || partner.username}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "0.8rem",
//                     color: partner._id === activeChat ? "#64b5f6" : "#666",
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   @{partner.username}
//                 </div>
//               </div>
//             </div>
//           ))}
          
//           {memoizedPartners.current.length > 50 && (
//             <div style={{ padding: "1rem", textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
//               Showing 50 of {memoizedPartners.current.length} conversations
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default ConversationsList;