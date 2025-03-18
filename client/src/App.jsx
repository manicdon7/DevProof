import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "../components/navbar";
import HomePage from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import { ProtectedRoute } from "./Providers/Protected";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.config";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
