import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import Dashboard from '@/pages/Dashboard';
import LandingPage from '@/pages/LandingPage';
import ClientPortalPage from '@/pages/ClientPortalPage';
import BucketView from '@/pages/BucketView';
import { useAuth } from '@/contexts/AuthContext';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      {/* Public client portal – no auth required */}
      <Route path="/event/:code" element={<ClientPortalPage />} />
      <Route path="/event/:code/bucket/:bucketId" element={<BucketView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
