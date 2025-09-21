'use client';

import { useAuth } from '@/components/AuthProvider';
import LoginForm from '@/components/LoginForm';
import NewDashboard from '@/components/NewDashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? <NewDashboard /> : <LoginForm />;
}