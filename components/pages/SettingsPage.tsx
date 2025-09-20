'use client';

import { useState, useEffect } from 'react';
import { Settings, Key, Database, Bell, Save, TestTube } from 'lucide-react';

interface SettingsPageProps {
  token: string;
}

export default function SettingsPage({ token }: SettingsPageProps) {
  const [apolloApiKey, setApolloApiKey] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchSettings, setSearchSettings] = useState({
    locations: ['United States'],
    industries: ['Technology', 'Software'],
    companySizes: ['1-10', '11-50', '51-200']
  });
  const [notifications, setNotifications] = useState({
    emailAssignments: true,
    emailReports: false,
    systemAlerts: true
  });

  useEffect(() => {
    // جلب الإعدادات الحالية
    const savedKey = localStorage.getItem('apollo_api_key');
    const savedSettings = localStorage.getItem('apollo_search_settings');
    if (savedKey) {
      setApolloApiKey(savedKey);
    }
    if (savedSettings) {
      setSearchSettings(JSON.parse(savedSettings));
    }
  }, []);

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
      // حفظ مفتاح Apollo في التخزين المحلي
      localStorage.setItem('apollo_api_key', apolloApiKey);
      localStorage.setItem('apollo_search_settings', JSON.stringify(searchSettings));
      
      setTestResult('✅ تم حفظ الإعدادات بنجاح');
    } catch (error) {
      setTestResult('❌ فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مفتاح API الخاص بـ Apollo.io
                </label>
                <div className="flex space-x-3 space-x-reverse">
                  <input
                    type="password"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="أدخل مفتاح API الخاص بك"
                    value={apolloApiKey}
                    onChange={(e) => setApolloApiKey(e.target.value)}
                  />
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
                <h4 className="text-md font-medium text-gray-900 mb-4">إعدادات البحث</h4>
                
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
                      <option value="United States">الولايات المتحدة</option>
                      <option value="United Arab Emirates">الإمارات</option>
                      <option value="Saudi Arabia">السعودية</option>
                      <option value="Egypt">مصر</option>
                      <option value="Jordan">الأردن</option>
                      <option value="Kuwait">الكويت</option>
                      <option value="Qatar">قطر</option>
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
                      <option value="Technology">تكنولوجيا</option>
                      <option value="Software">برمجيات</option>
                      <option value="Healthcare">رعاية صحية</option>
                      <option value="Finance">مالية</option>
                      <option value="Education">تعليم</option>
                      <option value="Retail">تجارة تجزئة</option>
                      <option value="Manufacturing">تصنيع</option>
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
                      <option value="1-10">1-10 موظف</option>
                      <option value="11-50">11-50 موظف</option>
                      <option value="51-200">51-200 موظف</option>
                      <option value="201-500">201-500 موظف</option>
                      <option value="501-1000">501-1000 موظف</option>
                      <option value="1001+">1001+ موظف</option>
                    </select>
                  </div>
                </div>
                
                <p className="mt-2 text-xs text-gray-500">
                  اضغط Ctrl (أو Cmd) لاختيار عدة خيارات
                </p>
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
                  <input
                    type="text"
                    value="SQLite"
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    مسار قاعدة البيانات
                  </label>
                  <input
                    type="text"
                    value="./database.sqlite"
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 space-x-reverse">
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