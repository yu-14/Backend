import app from './app.js';
import { testConnection } from './config/database.js';

const PORT = process.env.PORT || 3000;

// Start server
async function startServer() {
  try {
    // Test database connection (but don't exit if not configured)
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Task Scheduler API Server running on port ${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
      console.log(`\n⚠️  To use the API, please click "Connect to Supabase" in the top right corner`);
      console.log('\n📋 Available Endpoints:');
      console.log('  POST   /tasks                    - Create a new task');
      console.log('  GET    /tasks/:task_str_id       - Get task by string ID');
      console.log('  PUT    /tasks/:task_str_id/status - Update task status');
      console.log('  GET    /tasks/next-to-process    - Get next task to process');
      console.log('  GET    /tasks/pending            - Get pending tasks');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();