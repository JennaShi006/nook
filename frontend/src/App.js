import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import CreateListing from './pages/CreateListing';
import ProtectedRoute from "./components/ProtectedRoute"; // Import the ProtectedRoute

function App() {
  return (
    <Router>
      <Header /> {/* this makes the header show up on all pages */}
      <main> 
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes - Require Authentication AND Verification */}
          <Route 
            path="/account" 
            element={
              <ProtectedRoute requireVerification={true}>
                <AccountSettingsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/create-listing" 
            element={
              <ProtectedRoute requireVerification={true}>
                <CreateListing />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route for unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;