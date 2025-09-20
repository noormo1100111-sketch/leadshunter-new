'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, Building2, CheckCircle, Clock, Download, RefreshCw, Settings } from 'lucide-react';
import AdminPanel from './AdminPanel';

interface Company {
  id: number;
  name: string;
  email: string;
  industry: string;
  size: string;
  location: string;
  status: string;
  assigned_to?: number;
  assigned_user_name?: string;
  contacted_user_name?: string;
}

interface Analytics {
  statusStats: { status: string; count: number }[];
  userStats: { name: string; contacted_count: number }[];
  totalCompanies: number;
  contactedCompanies: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [assignUserId, setAssignUserId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = async () => {
    if (!token) return;
    
    try {
      const [companiesRes, analyticsRes, usersRes] = await Promise.all([
        fetch(`/api/companies?search=${search}&status=${statusFilter}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        user?.role === 'admin' ? fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        }) : Promise.resolve({ json: () => ({ users: [] }) })
      ]);

      const companiesData = await companiesRes.json();
      const analyticsData = await analyticsRes.json();
      const usersData = await usersRes.json();

      setCompanies(companiesData.companies || []);
      setAnalytics(analyticsData);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, token]);

  const syncApollo = async () => {
    if (!token) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/companies/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ limit: 50 })
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignCompanies = async () => {
    if (!token || !assignUserId || selectedCompanies.length === 0) return;
    
    try {
      const res = await fetch('/api/companies/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyIds: selectedCompanies,
          userId: parseInt(assignUserId)
        })
      });
      
      if (res.ok) {
        setSelectedCompanies([]);
        setAssignUserId('');
        fetchData();
      }
    } catch (error) {
      console.error('Assignment failed:', error);
    }
  };

  const exportCSV = async () => {
    if (!token) return;
    
    try {
      const res = await fetch('/api/companies/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'companies.csv';
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const markContacted = async (companyId: number) => {
    if (!token) return;
    
    try {
      await fetch(`/api/companies/${companyId}/contact`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Failed to mark as contacted:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">صائد العملاء</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">مرحبا، {user?.name}</span>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  لوحة الإدارة
                </button>
              )}
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                تسجيل خروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">إجمالي الشركات</dt>
                      <dd className="text-lg font-medium text-gray-900">{analytics.totalCompanies}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">تم التواصل</dt>
                      <dd className="text-lg font-medium text-gray-900">{analytics.contactedCompanies}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">في الانتظار</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.totalCompanies - analytics.contactedCompanies}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">معدل الإنجازات</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.totalCompanies > 0 
                          ? Math.round((analytics.contactedCompanies / analytics.totalCompanies) * 100)
                          : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">توزيع حالة الشركات</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.statusStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {user?.role === 'admin' && analytics.userStats.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">الشركات التي تم التواصل معها بواسطة المستخدم</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.userStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="contacted_count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="ابحث عن شركة..."
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">جميع الحالات</option>
                  <option value="uncontacted">لم يتم التواصل</option>
                  <option value="assigned">معين</option>
                  <option value="contacted">تم التواصل</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                {user?.role === 'admin' && (
                  <>
                    <button
                      onClick={syncApollo}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {loading ? 'جاري المزامنة...' : 'مزامنة أبولو'}
                    </button>
                    
                    {selectedCompanies.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <select
                          className="border border-gray-300 rounded-md px-3 py-2"
                          value={assignUserId}
                          onChange={(e) => setAssignUserId(e.target.value)}
                        >
                          <option value="">اختر مستخدم</option>
                          {users.filter(u => u.role === 'user').map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={assignCompanies}
                          disabled={!assignUserId}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          تعيين ({selectedCompanies.length})
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  تصدير CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Panel */}
        {showAdminPanel && user?.role === 'admin' && (
          <div className="mb-6">
            <AdminPanel token={token || ''} />
          </div>
        )}

        {/* Companies Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {companies.map((company) => (
              <li key={company.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {user?.role === 'admin' && (
                      <input
                        type="checkbox"
                        className="mr-4"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCompanies([...selectedCompanies, company.id]);
                          } else {
                            setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                          }
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {company.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            company.status === 'contacted' ? 'bg-green-100 text-green-800' :
                            company.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {company.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {company.email} • {company.industry} • {company.location}
                          </p>
                        </div>
                        {company.assigned_user_name && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>معين إلى: {company.assigned_user_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {company.status === 'assigned' && company.assigned_to === user?.id && (
                    <button
                      onClick={() => markContacted(company.id)}
                      className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      وضع علامة تم التواصل
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}