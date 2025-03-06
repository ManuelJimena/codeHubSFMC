import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import CreateSnippetPage from './pages/CreateSnippetPage';
import SnippetDetailPage from './pages/SnippetDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import UserSnippetsPage from './pages/UserSnippetsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import AdminPage from './pages/AdminPage';
import AIPage from './pages/AIPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create" element={<CreateSnippetPage />} />
            <Route path="/snippet/:id" element={<SnippetDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/my-snippets" element={<UserSnippetsPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/ai" element={<AIPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;