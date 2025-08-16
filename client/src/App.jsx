import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Career from './pages/Career';
import Learning from './pages/Learning';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OtpVerification from './pages/OtpVerification';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/otp" element={<OtpVerification />} />

            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/career" element={<PrivateRoute><Career /></PrivateRoute>} />
            <Route path="/learning" element={<PrivateRoute><Learning /></PrivateRoute>} />
            <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
