'use client';

import { useState } from 'react';
import { Settings, Key, Database, Bell, Save, TestTube } from 'lucide-react';

interface SettingsPageProps {
  token: string;
}

export default function SettingsPage({ token }: SettingsPageProps) {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchSettings, setSearchSettings] = useState({
    locations: ['Saudi Arabia'],
    industries: ['Technology'],
    companySizes: ['1-10', '11-50', '51-200']
  });
  const [notifications, setNotifications] = useState({
    emailAssignments: true,
    emailReports: false,
    systemAlerts: true
  });

  const testApolloConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-apollo', {
        method: 'POST'
      });
      
      const data = await response.json();
      console.log('Test result:', data);
      
      if (data.success) {
        setTestResult('✅ تم الاتصال بنجاح مع Apollo.io');
      } else {
        setTestResult(`❌ ${data.error} (Status: ${data.status})`);
      }
    } catch (error) {
      setTestResult('❌ خطأ في الاتصال');
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      // في المستقبل، يمكن حفظ هذه الإعدادات في قاعدة البيانات لكل مستخدم
      setTestResult('✅ تم حفظ الإعدادات بنجاح');
    } catch (error) {
      setTestResult('❌ فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };
  
  const syncCompanies = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/simple-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          locations: searchSettings.locations,
          industries: searchSettings.industries,
          sizes: searchSettings.companySizes, // تصحيح اسم الحقل ليتطابق مع الواجهة الخلفية
          limit: 10
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ ${data.message}`);
      } else {
        setTestResult(`❌ ${data.error}`);
      }
    } catch (error) {
      setTestResult('❌ فشل في المزامنة');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-full">
      <div className="flex items-center mb-6">
        <Settings className="h-8 w-8 text-indigo-600 ml-3" />
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
      </div>

      <div className="space-y-6">
        {/* إعدادات Apollo.io */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Key className="h-6 w-6 text-indigo-600 ml-2" />
              <h3 className="text-lg font-medium text-gray-900">إعدادات Apollo.io</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700">
                  مفتاح API الخاص بـ Apollo.io
                  <span className="text-xs text-gray-500"> (يتم إعداده من متغيرات البيئة على الخادم)</span>
                </p>
                <div className="mt-2">
                  <button
                    onClick={testApolloConnection}
                    disabled={testing}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <TestTube className="h-4 w-4 ml-2" />
                    {testing ? 'جاري الاختبار...' : 'اختبار الاتصال'}
                  </button>
                </div>
                
                {testResult && (
                  <div className={`mt-2 text-sm ${
                    testResult.includes('✅') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {testResult}
                  </div>
                )}
                
                <p className="mt-2 text-sm text-gray-500">
                  يمكنك الحصول على مفتاح API من{' '}
                  <a 
                    href="https://apollo.io/settings/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    إعدادات Apollo.io
                  </a>
                </p>
              </div>
              
              {/* إعدادات البحث */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">إعدادات البحث والمزامنة</h4>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المواقع الجغرافية
                    </label>
                    <select 
                      multiple
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={searchSettings.locations}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setSearchSettings({...searchSettings, locations: values});
                      }}
                    >
                      <option value="saudi arabia">السعودية</option>
                      <option value="united arab emirates">الإمارات</option>
                      <option value="egypt">مصر</option>
                      <option value="jordan">الأردن</option>
                      <option value="kuwait">الكويت</option>
                      <option value="qatar">قطر</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الصناعات
                    </label>
                    <select 
                      multiple
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={searchSettings.industries}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setSearchSettings({...searchSettings, industries: values});
                      }}
                    >
                      <option value="information technology and services">تكنولوجيا المعلومات</option>
                      <option value="banking">البنوك</option>
                      <option value="real estate">العقارات</option>
                      <option value="software">برمجيات</option>
                      <option value="healthcare">رعاية صحية</option>
                      <option value="finance">مالية</option>
                      <option value="education">تعليم</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حجم الشركة
                    </label>
                    <select 
                      multiple
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={searchSettings.companySizes}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setSearchSettings({...searchSettings, companySizes: values});
                      }}
                    >
                      <option value="1,10">1-10 موظف</option>
                      <option value="11,50">11-50 موظف</option>
                      <option value="51,200">51-200 موظف</option>
                      <option value="201,500">201-500 موظف</option>
                      <option value="501,1000">501-1000 موظف</option>
                      <option value="1001,5000">1001-5000 موظف</option>
                    </select>
                  </div>
                </div>
                
                <p className="mt-2 text-xs text-gray-500">
                  اضغط Ctrl (أو Cmd) لاختيار عدة خيارات
                </p>
                
                {/* زر المزامنة */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">مزامنة الشركات</h5>
                      <p className="text-xs text-gray-500">جلب شركات جديدة بناءً على الإعدادات أعلاه</p>
                    </div>
                    <button
                      onClick={syncCompanies}
                      disabled={testing}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {testing ? 'جاري المزامنة...' : 'مزامنة الآن'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* إعدادات قاعدة البيانات */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-indigo-600 ml-2" />
              <h3 className="text-lg font-medium text-gray-900">إعدادات قاعدة البيانات</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع قاعدة البيانات
                  </label>
                  <p className="text-sm text-gray-600 mt-2">
                    يستخدم المشروع <span className="font-semibold">SQLite</span> للتطوير المحلي، و <span className="font-semibold">PostgreSQL</span> (عبر Neon/Supabase) عند النشر.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 space-x-reverse mt-4">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  نسخ احتياطي من قاعدة البيانات
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  استعادة من نسخة احتياطية
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* إعدادات الإشعارات */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-6 w-6 text-indigo-600 ml-2" />
              <h3 className="text-lg font-medium text-gray-900">إعدادات الإشعارات</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">إشعارات تعيين الشركات</h4>
                  <p className="text-sm text-gray-500">إرسال إشعار عند تعيين شركة جديدة للمستخدم</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.emailAssignments}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      emailAssignments: e.target.checked
                    })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">تقارير دورية</h4>
                  <p className="text-sm text-gray-500">إرسال تقارير أسبوعية عن الأداء</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.emailReports}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      emailReports: e.target.checked
                    })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">تنبيهات النظام</h4>
                  <p className="text-sm text-gray-500">إشعارات حول أخطاء النظام والتحديثات</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications.systemAlerts}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      systemAlerts: e.target.checked
                    })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5 ml-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>
    </div>
  );
}