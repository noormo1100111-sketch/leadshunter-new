# صائد العملاء - نظام إدارة العملاء المحتملين الشامل

تطبيق حديث لإدارة العملاء المحتملين مبني بـ Next.js و TypeScript و SQLite مع التكامل مع Apollo.io لجمع بيانات الشركات.

## المميزات

- **جمع البيانات والتكامل مع API**: الاتصال بـ Apollo.io API لجلب وحفظ بيانات الشركات
- **مصادقة المستخدمين**: مصادقة JWT مع التحكم في الأدوار (مدير/مستخدم)
- **إدارة الشركات**: لوحة تحكم المدير لتعيين الشركات للمستخدمين
- **لوحة التحليلات**: رسوم بيانية تفاعلية تظهر إحصائيات التواصل وأداء المستخدمين
- **واجهة حديثة**: تصميم نظيف ومتجاوب مع Tailwind CSS
- **وظيفة التصدير**: تصدير بيانات الشركات إلى CSV
- **التحديثات المباشرة**: تحديثات مباشرة للوحة التحكم وتتبع الحالة

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with custom query layer
- **Authentication**: JWT tokens
- **Charts**: Recharts
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this
JWT_SECRET=your-jwt-secret-here-change-this
APOLLO_API_KEY=your-apollo-api-key-here
DATABASE_URL=./database.sqlite
```

**Important**: Replace the secret keys with secure random strings in production.

### 3. Get Apollo.io API Key

1. Sign up at [Apollo.io](https://apollo.io)
2. Go to Settings > API Keys
3. Generate a new API key
4. Add it to your `.env.local` file

### 4. Initialize Database

```bash
npm run db:migrate
```

This creates the SQLite database and tables, plus an admin user:
- **Email**: admin@leadshunter.com
- **Password**: password

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Admin Features

1. **Login** with admin credentials
2. **Sync Companies**: Click "Sync Apollo" to import companies from Apollo.io
3. **Assign Companies**: Select companies and assign them to users
4. **View Analytics**: Monitor user performance and contact statistics
5. **Export Data**: Download company data as CSV

### User Features

1. **Register** a new account or login
2. **View Assigned Companies**: See companies assigned to you
3. **Mark as Contacted**: Update company status when contacted
4. **Export Your Data**: Download your assigned companies

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Token verification

### Companies
- `GET /api/companies` - List companies (with pagination, search, filters)
- `POST /api/companies` - Create company (admin only)
- `POST /api/companies/sync` - Sync from Apollo.io (admin only)
- `POST /api/companies/assign` - Assign companies to users (admin only)
- `POST /api/companies/[id]/contact` - Mark company as contacted
- `GET /api/companies/export` - Export companies to CSV

### Users & Analytics
- `GET /api/users` - List users (admin only)
- `GET /api/analytics` - Get dashboard analytics

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `name` - User's full name
- `role` - 'admin' or 'user'
- `created_at` - Timestamp

### Companies Table
- `id` - Primary key
- `name` - Company name (unique)
- `email` - Company email
- `industry` - Industry sector
- `size` - Company size
- `location` - Geographic location
- `status` - 'uncontacted', 'assigned', or 'contacted'
- `assigned_to` - User ID (foreign key)
- `contacted_by` - User ID who contacted (foreign key)
- `contacted_at` - Contact timestamp
- `created_at` - Creation timestamp

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- SQL injection prevention with parameterized queries
- Input validation and sanitization

## Development

### Project Structure

```
leadshunter/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── components/        # React components
├── lib/              # Utility functions
├── scripts/          # Database scripts
└── public/           # Static assets
```

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Database not found**: Run `npm run db:migrate`
2. **Apollo API errors**: Check your API key in `.env.local`
3. **Authentication issues**: Verify JWT_SECRET is set
4. **Permission errors**: Ensure admin role for management features

### Logs

Check the browser console and terminal for error messages. The application includes comprehensive error handling and logging.

## النشر على الخادم

### 1. النشر على Vercel
```bash
npm install -g vercel
vercel
```

### 2. إعداد متغيرات البيئة على Vercel
- `NEXTAUTH_SECRET`: مفتاح عشوائي قوي
- `JWT_SECRET`: مفتاح عشوائي قوي آخر
- `APOLLO_API_KEY`: مفتاح Apollo.io API
- `DATABASE_URL`: ./database.sqlite

### 3. النشر على خادم VPS
```bash
# استنساخ المشروع
git clone https://github.com/YOUR_USERNAME/leadshunter.git
cd leadshunter

# تثبيت التبعيات
npm install

# إنشاء ملف البيئة
cp .env.example .env.local
# عدّل المتغيرات في .env.local

# بناء المشروع
npm run build

# تشغيل الخادم
npm start
```

### 4. استخدام قاعدة بيانات خارجية (اختياري)
يمكن استخدام PostgreSQL أو MySQL بدلاً من SQLite:
```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# MySQL
DATABASE_URL=mysql://user:password@host:port/database
```

## License

This project is for educational and demonstration purposes.