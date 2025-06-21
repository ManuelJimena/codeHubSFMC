import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthRedirectMiddleware from './components/AuthRedirectMiddleware';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Importación con lazy para mejor rendimiento y manejo de errores
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage')); 
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CreateSnippetPage = lazy(() => import('./pages/CreateSnippetPage'));
const EditSnippetPage = lazy(() => import('./pages/EditSnippetPage'));
const SnippetDetailPage = lazy(() => import('./pages/SnippetDetailPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const UserSnippetsPage = lazy(() => import('./pages/UserSnippetsPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const UpdatePasswordPage = lazy(() => import('./pages/UpdatePasswordPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AIPage = lazy(() => import('./pages/AIPage'));

// Componente de carga
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <AuthRedirectMiddleware />
          <Navbar />
          <main className="flex-grow">
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/create" element={<CreateSnippetPage />} />
                  <Route path="/edit/:id" element={<EditSnippetPage />} />
                  <Route path="/snippet/:id" element={<SnippetDetailPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/my-snippets" element={<UserSnippetsPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/update-password" element={<UpdatePasswordPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/ai" element={<AIPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;