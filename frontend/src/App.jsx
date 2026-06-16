import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import GalleryPage from './pages/GalleryPage';
import LettersPage from './pages/LettersPage';
import TimelinePage from './pages/TimelinePage';
import MemoriesPage from './pages/MemoriesPage';
import BucketListPage from './pages/BucketListPage';
import DistancePage from './pages/DistancePage';
import MusicRoom from './pages/MusicRoom';
import TimeCapsulePage from './pages/TimeCapsulePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="app">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/" element={<LandingPage />} />

              {/* Protected Routes with Main Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ChatPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Pages with their own full-page layouts (no MainLayout wrapper) */}
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <GalleryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/letters"
                element={
                  <ProtectedRoute>
                    <LettersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute>
                    <TimelinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/memories"
                element={
                  <ProtectedRoute>
                    <MemoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bucket-list"
                element={
                  <ProtectedRoute>
                    <BucketListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/distance"
                element={
                  <ProtectedRoute>
                    <DistancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/music"
                element={
                  <ProtectedRoute>
                    <MusicRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/time-capsule"
                element={
                  <ProtectedRoute>
                    <TimeCapsulePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#ec4899',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;