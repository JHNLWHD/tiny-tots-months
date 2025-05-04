
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';

import Layout from './components/Layout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Month from './pages/Month';
import Landing from './pages/Landing';
import SharedBaby from './pages/SharedBaby';
import SharedMonth from './pages/SharedMonth';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Upgrade from './pages/Upgrade';

import './App.css';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/shared/baby/:shareToken" element={<SharedBaby />} />
            <Route path="/shared/month/:shareToken" element={<SharedMonth />} />
            
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="month/:monthId" element={<Month />} />
              <Route path="upgrade" element={<Upgrade />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
