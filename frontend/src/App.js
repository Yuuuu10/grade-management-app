import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rules from './pages/Rules';
import Locations from './pages/Locations';
import Games from './pages/Games';
import GameForm from './pages/GameForm';
import Statistics from './pages/Statistics';
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
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/rules" element={
                <PrivateRoute>
                  <Rules />
                </PrivateRoute>
              } />
              <Route path="/locations" element={
                <PrivateRoute>
                  <Locations />
                </PrivateRoute>
              } />
              <Route path="/games" element={
                <PrivateRoute>
                  <Games />
                </PrivateRoute>
              } />
              <Route path="/games/new" element={
                <PrivateRoute>
                  <GameForm />
                </PrivateRoute>
              } />
              <Route path="/statistics" element={
                <PrivateRoute>
                  <Statistics />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
