require('dotenv').config();
const app = require('./src/app');
const { supabaseAdmin } = require('./src/config/supabase');
const http = require('http');
const { Server } = require('socket.io');
const { initializeSocket } = require('./src/config/socket');

// Test Supabase connection (non-blocking)
const testSupabaseConnection = async () => {
  try {
    // Check if URL looks like a placeholder
    if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project-id')) {
      console.log('⚠️  Supabase credentials not configured yet');
      console.log('📝 Update .env with your Supabase project credentials');
      console.log('   See SETUP_GUIDE.md for instructions');
      return false;
    }

    const { data, error } = await supabaseAdmin.from('profiles').select('count');
    if (error) throw error;
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('⚠️  Supabase connection warning:', error.message);
    console.log('📝 Please check your Supabase credentials in .env');
    return false;
  }
};

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize socket handlers
initializeSocket(io);

// Start server
const PORT = process.env.PORT || 5000;

testSupabaseConnection().then((connected) => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`💕 Our Universe - Private Space for Ajesh & Shofi`);
    if (connected) {
      console.log(`🗄️  Database: Supabase PostgreSQL (connected)`);
      console.log(`📁 Storage: Supabase Storage`);
      console.log(`🔐 Auth: Supabase Authentication`);
      console.log(`⚡ Realtime: Supabase Realtime + Socket.IO`);
    } else {
      console.log(`⚠️  Database: Supabase PostgreSQL (not connected)`);
      console.log(`   Configure SUPABASE_URL and keys in .env to enable`);
    }
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});