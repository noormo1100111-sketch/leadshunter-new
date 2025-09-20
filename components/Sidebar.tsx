'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { 
  Home, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Home },
    { id: 'companies', label: 'الشركات', icon: Building2 },
    { id: 'reports', label: 'التقارير', icon: BarChart3 },
    ...(user?.role === 'admin' ? [
      { id: 'users', label: 'المستخدمين', icon: Users },
      { id: 'settings', label: 'الإعدادات', icon: Settings }
    ] : [])
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:hidden`}>
        
        {/* Header */}
        <div className="flex items-center justify-center h-20 bg-gradient-to-r from-indigo-600 to-purple-600 border-b border-slate-700">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">صائد العملاء</h1>
            <p className="text-xs text-indigo-200">نظام إدارة العملاء المحتملين</p>
          </div>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="mr-4">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-slate-300">{user?.role === 'admin' ? 'مدير النظام' : 'مستخدم'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-4 py-4 mb-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
                }`}
              >
                <Icon className="ml-3 h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 border border-red-600/30"
          >
            <LogOut className="ml-3 h-5 w-5" />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}