'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import Sidebar from './Sidebar';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

export default function NewDashboard() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const renderCurrentPage = () => {
    if (!token || !user) return null;

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage token={token} userRole={user.role} userId={user.id} />;
      case 'companies':
        return <CompaniesPage token={token} userRole={user.role} userId={user.id} />;
      case 'reports':
        return <ReportsPage token={token} userRole={user.role} />;
      case 'users':
        return user.role === 'admin' ? <UsersPage token={token} /> : null;
      case 'settings':
        return user.role === 'admin' ? <SettingsPage token={token} /> : null;
      default:
        return <DashboardPage token={token} userRole={user.role} userId={user.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* شريط التنقل العلوي للشاشات الكبيرة */}
      <div className="hidden lg:block bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">صائد العملاء</h1>
            <div className="flex items-center gap-6">
              {[
                { id: 'dashboard', label: 'لوحة التحكم' },
                { id: 'companies', label: 'الشركات' },
                { id: 'reports', label: 'التقارير' },
                ...(user?.role === 'admin' ? [
                  { id: 'users', label: 'المستخدمين' },
                  { id: 'settings', label: 'الإعدادات' }
                ] : [])
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center gap-3 mr-6 border-r pr-6">
                <span className="text-sm text-gray-600">مرحباً، {user?.name}</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.reload();
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  تسجيل خروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full">
        {renderCurrentPage()}
      </div>
    </div>
  );
}