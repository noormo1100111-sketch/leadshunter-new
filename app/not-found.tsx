export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-4">الصفحة غير موجودة</p>
        <a href="/" className="text-blue-600 hover:text-blue-800">
          العودة للصفحة الرئيسية
        </a>
      </div>
    </div>
  )
}