'use client';

import { useState, useEffect } from 'react';
import { Building2, Search, Download, RefreshCw } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  email: string;
  industry: string;
  size: string;
  location: string;
  status: string;
  assigned_user_name?: string;
}

interface CompaniesPageProps {
  token: string;
  userRole: string;
  userId: number;
}

export default function CompaniesPage({ token, userRole, userId }: CompaniesPageProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [assignUserId, setAssignUserId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      const [companiesRes, usersRes] = await Promise.all([
        fetch(`/api/companies?search=${search}&status=${statusFilter}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        userRole === 'admin' ? fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        }) : Promise.resolve({ json: () => ({ users: [] }) })
      ]);

      const companiesData = await companiesRes.json();
      const usersData = await usersRes.json();

      setCompanies(companiesData.companies || []);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('فشل في جلب البيانات:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const syncApollo = async () => {
    console.log('🚀 بدء المزامنة من الواجهة');
    setLoading(true);
    try {
      console.log('📡 إرسال طلب إلى /api/companies/sync');
      
      const response = await fetch('/api/companies/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ limit: 10 })
      });
      
      console.log('📝 استجابة الخادم:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📊 بيانات الاستجابة:', data);
      
      if (data.debug) {
        console.log('🔍 تفاصيل التشخيص:', data.debug);
        console.table(data.debug.companiesFromApollo);
      }
      
      if (response.ok) {
        alert(data.message || `تمت مزامنة ${data.total} شركة، تم إضافة ${data.imported} شركة جديدة`);
        console.log('🔄 تحديث قائمة الشركات');
        await fetchData();
        setStatusFilter('');
        setCurrentPage(1);
      } else {
        console.error('❌ خطأ في الاستجابة:', data);
        alert(`خطأ: ${JSON.stringify(data)}`);
        await fetchData();
      }
    } catch (error) {
      console.error('❌ خطأ في الشبكة:', error);
      alert('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const assignCompanies = async () => {
    if (!assignUserId || selectedCompanies.length === 0) return;
    
    try {
      await fetch('/api/companies/assign', {
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
      
      setSelectedCompanies([]);
      setAssignUserId('');
      fetchData();
    } catch (error) {
      console.error('فشل في التعيين:', error);
    }
  };

  const markContacted = async (companyId: number) => {
    try {
      await fetch(`/api/companies/${companyId}/contact`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('فشل في وضع علامة تم التواصل:', error);
    }
  };

  return (
    <div className="p-6 w-full min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 text-indigo-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-900">إدارة الشركات</h1>
        </div>
      </div>

      {/* أدوات التحكم */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="ابحث عن شركة..."
                className="pr-10 pl-4 py-2 border border-gray-300 rounded-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
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
          
          <div className="flex items-center space-x-2 space-x-reverse">
            {userRole === 'admin' && (
              <>
                <button
                  onClick={syncApollo}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loading ? 'جاري المزامنة...' : 'مزامنة أبولو'}
                </button>
                
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchData();
                  }}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تحديث القائمة
                </button>
                
                <button
                  onClick={async () => {
                    if (confirm('هل أنت متأكد من حذف جميع الشركات؟')) {
                      try {
                        await fetch('/api/companies/clear', {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        alert('تم حذف جميع الشركات');
                        fetchData();
                      } catch (error) {
                        alert('فشل في الحذف');
                      }
                    }
                  }}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  حذف جميع الشركات
                </button>
                
                {selectedCompanies.length > 0 && (
                  <div className="flex items-center space-x-2 space-x-reverse">
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
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              تصدير CSV
            </button>
          </div>
        </div>
      </div>

      {/* جدول الشركات */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {userRole === 'admin' && (
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    <input type="checkbox" />
                  </th>
                )}
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">اسم الشركة</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">الصناعة</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">معين إلى</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  {userRole === 'admin' && (
                    <td className="px-3 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCompanies([...selectedCompanies, company.id]);
                          } else {
                            setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                          }
                        }}
                      />
                    </td>
                  )}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{company.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-700">{company.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-700">{company.industry}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-2 text-xs font-bold rounded-lg ${
                      company.status === 'contacted' ? 'bg-green-100 text-green-800 border border-green-200' :
                      company.status === 'assigned' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {company.status === 'contacted' ? 'تم التواصل' :
                       company.status === 'assigned' ? 'معين' : 'لم يتم التواصل'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-700">
                      {company.assigned_user_name || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {company.status === 'assigned' && (
                      <button
                        onClick={() => markContacted(company.id)}
                        className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors"
                      >
                        وضع علامة تم التواصل
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}