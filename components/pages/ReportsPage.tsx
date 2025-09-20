'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Building2, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Analytics {
  statusStats: { status: string; count: number }[];
  userStats: { name: string; contacted_count: number }[];
  totalCompanies: number;
  contactedCompanies: number;
}

interface ReportsPageProps {
  token: string;
  userRole: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ReportsPage({ token, userRole }: ReportsPageProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
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
    <div className="p-4 sm:p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-indigo-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-900">التقارير والتحليلات</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يوم</option>
            <option value="90">آخر 3 أشهر</option>
            <option value="365">آخر سنة</option>
          </select>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </button>
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-lg rounded-xl border border-blue-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-900 mb-1">{analytics.totalCompanies}</p>
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
                  <p className="text-2xl font-bold text-green-900 mb-1">{analytics.contactedCompanies}</p>
                  <p className="text-sm font-medium text-green-700">تم التواصل</p>
                </div>
                <div className="flex-shrink-0">
                  <TrendingUp className="h-10 w-10 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden shadow-lg rounded-xl border border-yellow-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-900 mb-1">
                    {analytics.totalCompanies - analytics.contactedCompanies}
                  </p>
                  <p className="text-sm font-medium text-yellow-700">في الانتظار</p>
                </div>
                <div className="flex-shrink-0">
                  <Calendar className="h-10 w-10 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow-lg rounded-xl border border-purple-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-900 mb-1">{successRate}%</p>
                  <p className="text-sm font-medium text-purple-700">معدل الإنجازات</p>
                </div>
                <div className="flex-shrink-0">
                  <Users className="h-10 w-10 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الرسوم البيانية */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* توزيع حالة الشركات */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">توزيع حالة الشركات</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusStats.map(item => ({
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
                  {analytics.statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* أداء المستخدمين للمدير أو إحصائيات شخصية للمستخدم */}
          <div className="bg-white p-6 rounded-lg shadow">
            {userRole === 'admin' && analytics.userStats.length > 0 ? (
              <>
                <h3 className="text-lg font-medium mb-4">أداء المستخدمين</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.userStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="contacted_count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">أدائي الشخصي</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.statusStats.map(item => ({
                    name: item.status === 'contacted' ? 'تم التواصل' :
                          item.status === 'assigned' ? 'معين لي' : 'غير معين',
                    count: item.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>
      )}

      {/* جدول تفصيلي */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {userRole === 'admin' ? 'ملخص الأداء العام' : 'ملخص أدائي الشخصي'}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المؤشر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">القيمة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النسبة</th>
                  {userRole !== 'admin' && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهدف</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics?.statusStats.map((stat, index) => {
                  const percentage = analytics.totalCompanies > 0 
                    ? Math.round((stat.count / analytics.totalCompanies) * 100)
                    : 0;
                  
                  return (
                    <tr key={index} className={stat.status === 'contacted' ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.status === 'contacted' ? 'تم التواصل' :
                         stat.status === 'assigned' ? (
                           userRole === 'admin' ? 'معين' : 'معين لي'
                         ) : 'لم يتم التواصل'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`font-bold ${
                          stat.status === 'contacted' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {stat.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            stat.status === 'contacted' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {percentage}%
                          </span>
                          {userRole !== 'admin' && stat.status === 'contacted' && (
                            <div className="mr-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      {userRole !== 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stat.status === 'contacted' ? 'ممتاز!' :
                           stat.status === 'assigned' ? 'ابدأ التواصل' : '-'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {userRole !== 'admin' && analytics && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">نصائح لتحسين الأداء:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {analytics.contactedCompanies === 0 && (
                  <li>• ابدأ بالتواصل مع الشركات المعينة لك</li>
                )}
                {successRate < 50 && analytics.contactedCompanies > 0 && (
                  <li>• حاول زيادة معدل التواصل لتحقيق نتائج أفضل</li>
                )}
                {successRate >= 80 && (
                  <li>• أداء ممتاز! استمر في العمل الجيد</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}