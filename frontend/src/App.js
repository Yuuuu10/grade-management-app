import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MatchingDashboard from './pages/MatchingDashboard';
import UserDirectory from './pages/UserDirectory';
import OfferBoard from './pages/OfferBoard';
import OfferMessages from './pages/OfferMessages';
import AdminPanel from './pages/AdminPanel';
import Navigation from './components/Navigation';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/" element={
                <PrivateRoute>
                  <MatchingDashboard />
                </PrivateRoute>
              } />
              <Route path="/directory" element={
                <PrivateRoute>
                  <UserDirectory />
                </PrivateRoute>
              } />
              <Route path="/offers" element={
                <PrivateRoute>
                  <OfferBoard />
                </PrivateRoute>
              } />
              <Route path="/offers/:id" element={
                <PrivateRoute>
                  <OfferMessages />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
