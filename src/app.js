import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/tasks.js';
import { testConnection } from './config/database.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/tasks', taskRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Task Scheduler API',
    version: '1.0.0',
    endpoints: {
      'POST /tasks': 'Create a new task',
      'GET /tasks/:task_str_id': 'Get task by string ID',
      'PUT /tasks/:task_str_id/status': 'Update task status',
      'GET /tasks/next-to-process': 'Get next task to process',
      'GET /tasks/pending': 'Get pending tasks with sorting/pagination',
      'GET /health': 'Health check endpoint'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: ['An unexpected error occurred']
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    details: [`Path '${req.originalUrl}' does not exist`]
  });
});

export default app;