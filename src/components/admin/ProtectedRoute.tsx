import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminLogin } from './AdminLogin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onReturnToStorefront?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onReturnToStorefront,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#0b74de] border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-bold text-[#06284b]">Verifying Supabase Admin Permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onReturnToStorefront={onReturnToStorefront} />;
  }

  return <>{children}</>;
};
