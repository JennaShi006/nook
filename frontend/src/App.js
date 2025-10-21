import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import CreateListing from './pages/CreateListing';

function App() {
  return (
    <Router>
      <Header /> {/* this makes the header show up on all pages */}
      <main> 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/account" element={<AccountSettingsPage />} />
          <Route path="/create-listing" element={<CreateListing />} />
          {/* add more routes later like: */}
          {/* <Route path="/explore" element={<ExplorePage />} /> */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
