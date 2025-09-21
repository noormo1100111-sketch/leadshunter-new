'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, Building2, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';

interface Analytics {
  statusStats: { status: string; count: number }[];
  userStats: { name: string; contacted_count: number }[];
  totalCompanies: number;
  contactedCompanies: number;
}

interface Company {
  id: number;
  name: string;
  email: string;
  industry: string;
  status: string;
  contacted_at?: string;
}

interface DashboardPageProps {
  token: string;
  userRole: string;
  userId: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage({ token, userRole, userId }: DashboardPageProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('فشل في جلب التحليلات:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCompanies = async () => {
    if (userRole === 'admin') return;
    
    setCompaniesLoading(true);
    try {
      const res = await fetch('/api/companies?limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('فشل في جلب الشركات:', error);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const markContacted = async (companyId: number) => {
    try {
      await fetch(`/api/companies/${companyId}/contact`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyCompanies();
      fetchAnalytics();
    } catch (error) {
      console.error('فشل في وضع علامة تم التواصل:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchMyCompanies();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const successRate = analytics?.totalCompanies ? 
    Math.round((analytics.contactedCompanies / analytics.totalCompanies) * 100) : 0;

  return (
    <div className="p-6 w-full min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600">نظرة عامة على أداء النظام</p>
      </div>

      {/* البطاقات الإحصائية */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-lg rounded-xl border border-blue-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-blue-900 mb-1">{analytics.totalCompanies}</p>
                  <p className="text-sm font-medium text-blue-700">إجمالي الشركات</p>
                </div>
                <div className="flex-shrink-0">
                  <Building2 className="h-10 w-10 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-lg rounded-xl border border-green-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-green-900 mb-1">{analytics.contactedCompanies}</p>
                  <p className="text-sm font-medium text-green-700">تم التواصل</p>
                </div>
                <div className="flex-shrink-0">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden shadow-lg rounded-xl border border-yellow-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-yellow-900 mb-1">
                    {analytics.totalCompanies - analytics.contactedCompanies}
                  </p>
                  <p className="text-sm font-medium text-yellow-700">في الانتظار</p>
                </div>
                <div className="flex-shrink-0">
                  <Clock className="h-10 w-10 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow-lg rounded-xl border border-purple-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-purple-900 mb-1">{successRate}%</p>
                  <p className="text-sm font-medium text-purple-700">معدل الإنجازات</p>
                </div>
                <div className="flex-shrink-0">
                  <TrendingUp className="h-10 w-10 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الرسوم البيانية */}
      {analytics && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
          {/* توزيع حالة الشركات */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-800">توزيع حالة الشركات</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(analytics.statusStats || []).map(item => ({
                    ...item,
                    name: item.status === 'contacted' ? 'تم التواصل' :
                          item.status === 'assigned' ? 'معين' : 'لم يتم التواصل'
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.statusStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* أداء المستخدمين */}
          {userRole === 'admin' && (analytics.userStats || []).length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-gray-800">أداء المستخدمين</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.userStats || []}>
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

      {/* الشركات المعينة للمستخدم */}
      {userRole !== 'admin' && (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-indigo-600 ml-2" />
                <h3 className="text-lg font-bold text-gray-800">الشركات المعينة لي</h3>
              </div>
              <span className="text-sm text-gray-500">{companies.length} شركة</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {companiesLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">جاري تحميل الشركات...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="p-6 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">لا توجد شركات معينة لك حالياً</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الشركة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصناعة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{company.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{company.industry}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.status === 'contacted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {company.status === 'contacted' ? 'تم التواصل' : 'معين'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {company.status === 'assigned' ? (
                          <button
                            onClick={() => markContacted(company.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700 transition-colors"
                          >
                            وضع علامة تم التواصل
                          </button>
                        ) : (
                          <span className="text-green-600 text-xs font-medium">
                            تم التواصل {company.contacted_at && new Date(company.contacted_at).toLocaleDateString('ar')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* الأنشطة الأخيرة */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-6 sm:p-8">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-indigo-600 ml-2" />
            <h3 className="text-lg font-bold text-gray-800">الأنشطة الأخيرة</h3>
          </div>
          
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3 space-x-reverse">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 space-x-reverse">
                      <div>
                        <p className="text-sm text-gray-500">
                          تم التواصل مع شركة جديدة
                        </p>
                      </div>
                      <div className="text-left text-sm whitespace-nowrap text-gray-500">
                        منذ ساعتين
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3 space-x-reverse">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <Users className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 space-x-reverse">
                      <div>
                        <p className="text-sm text-gray-500">
                          تم تعيين 5 شركات جديدة للمستخدمين
                        </p>
                      </div>
                      <div className="text-left text-sm whitespace-nowrap text-gray-500">
                        منذ 4 ساعات
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              
              <li>
                <div className="relative">
                  <div className="relative flex space-x-3 space-x-reverse">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                        <Building2 className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 space-x-reverse">
                      <div>
                        <p className="text-sm text-gray-500">
                          تم مزامنة 50 شركة جديدة من Apollo.io
                        </p>
                      </div>
                      <div className="text-left text-sm whitespace-nowrap text-gray-500">
                        أمس
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}