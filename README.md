# 💕 Our Universe

> A private anniversary website for Ajesh & Shofi - Powered by Supabase

![Our Universe](https://img.shields.io/badge/Our-Universe-ec4899?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![React](https://img.shields.io/badge/Frontend-React-61dafb?style=for-the-badge&logo=react)
![Status](https://img.shields.io/badge/Status-In%20Development-blue?style=for-the-badge)

---

## ✨ Features

### 💌 Communication
- **Real-time Chat** - Private messaging with Supabase Realtime
- **Love Letters** - Write and send beautiful letters to each other
- **Love Notes** - Sticky notes board for quick messages

### 📸 Memories
- **Photo Gallery** - Upload and organize your favorite photos
- **Memories** - Document special moments with photos and stories
- **Timeline** - Visual timeline of your relationship milestones

### 🎯 Together
- **Bucket List** - Plan future adventures together
- **Time Capsules** - Messages to be opened on special dates

### 🗺️ More
- **Distance Calculator** - See the distance between you
- **Music Room** - Share and listen to music together
- **Settings** - Customize your experience

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Supabase JS** - Backend client
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Realtime

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier is fine)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/our-universe.git
cd our-universe
```

### 2. Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database schema from `supabase-schema.sql`
3. Create storage buckets (see SETUP_GUIDE.md)
4. Copy your API credentials

### 3. Configure Environment Variables

**Backend (.env)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

### 4. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 5. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Open the App
Visit [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
our-universe/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js      # Supabase client config
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── controllers/          # Request handlers
│   │   ├── routes/               # API routes
│   │   └── app.js                # Express app
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.js       # Supabase client
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state
│   │   ├── hooks/
│   │   │   ├── useRealtime.js    # Realtime hooks
│   │   │   └── useStorage.js     # Storage hooks
│   │   ├── pages/                # Page components
│   │   ├── App.jsx               # Main app
│   │   └── main.jsx              # Entry point
│   ├── .env
│   └── package.json
│
├── supabase-schema.sql           # Database schema
├── MIGRATION_PLAN.md             # Migration details
├── SETUP_GUIDE.md               # Detailed setup guide
└── README.md                    # This file
```

---

## 📋 Migration from MongoDB

This project was migrated from MongoDB + Cloudinary + JWT to Supabase.

### What Changed
| Before | After |
|--------|-------|
| MongoDB Atlas | Supabase PostgreSQL |
| Mongoose ODM | Supabase JS Client |
| Cloudinary | Supabase Storage |
| JWT (custom) | Supabase Auth |
| Socket.IO | Supabase Realtime |

### Migration Guide
See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for detailed migration information.

---

## 🗄️ Database Schema

### Tables
- **profiles** - User profiles (extends Supabase auth)
- **messages** - Chat messages
- **photos** - Gallery photos
- **letters** - Love letters
- **timeline_events** - Relationship milestones
- **memories** - Special memories
- **bucket_list_items** - Future goals
- **love_notes** - Sticky notes
- **time_capsules** - Time-locked messages

See [supabase-schema.sql](./supabase-schema.sql) for the complete schema.

---

## 🔐 Security

- **Row Level Security (RLS)** - Data access controlled at database level
- **Supabase Auth** - Secure authentication with email/password
- **Storage Policies** - Controlled access to file storage
- **HTTPS** - Required for production

---

## 🚀 Deployment

### Backend (Railway, Render, or VPS)
1. Set environment variables
2. Deploy from GitHub or upload files
3. Ensure `npm start` runs the server

### Frontend (Vercel, Netlify)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Environment Variables for Production
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (backend only)
- `VITE_SUPABASE_URL` - Supabase URL (frontend)
- `VITE_SUPABASE_ANON_KEY` - Anon key (frontend)

---

## 📝 To-Do (Before July 17)

- [ ] Complete Supabase setup
- [ ] Test all authentication flows
- [ ] Verify file uploads work
- [ ] Test realtime chat
- [ ] Add relationship start date
- [ ] Customize theme colors
- [ ] Add personal photos
- [ ] Write first love letter
- [ ] Deploy to production

---

## 🤝 Contributing

This is a private project for Ajesh & Shofi. No external contributions please.

---

## 📄 License

MIT License - Private use only

---

## 💝 Made with Love

Built for **Ajesh & Shofi** | Our Universe 🌟

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)