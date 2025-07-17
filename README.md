# Task Scheduler API

A comprehensive REST API for managing tasks with PostgreSQL backend, built with Express.js and Supabase. This is a **backend API server** that runs locally or on a Node.js hosting platform.

## Features

- ✅ Complete REST API with all required endpoints
- ✅ PostgreSQL database with proper schema and constraints
- ✅ Status transition validation with business logic
- ✅ Efficient SQL queries for task retrieval and sorting
- ✅ Modular route structure with validation middleware
- ✅ Comprehensive error handling and response formatting

## Important Notes

⚠️ **This is a backend API server, not a frontend application**
- Cannot be deployed to static hosting services like Netlify
- Requires a Node.js runtime environment
- Designed to be consumed by frontend applications or API clients

## Setup

### 1. Database Setup
Click "Connect to Supabase" in the top right to set up your database connection. The migration will automatically create the required `tasks` table with proper schema and indexes.

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
```

### 3. Run the Server
```bash
npm start        # Production mode
npm run dev      # Development mode with auto-reload
```

## Deployment Options

Since this is a Node.js backend API, you can deploy it to:

- **Railway**: `railway up` (recommended for APIs)
- **Render**: Connect your GitHub repo
- **Heroku**: `git push heroku main`
- **DigitalOcean App Platform**: Deploy from GitHub
- **AWS/GCP/Azure**: Container or serverless deployment

**Note**: Static hosting services like Netlify, Vercel (static), or GitHub Pages cannot run Node.js servers.

## API Endpoints

### Base Endpoints

#### `POST /tasks`
Create a new task.

**Request Body:**
```json
{
  "task_str_id": "TASK001",
  "description": "Process customer data",
  "estimated_time_minutes": 30
}
```

**Response:**
```json
{
  "internal_db_id": "123e4567-e89b-12d3-a456-426614174000",
  "task_str_id": "TASK001",
  "status": "pending"
}
```

#### `GET /tasks/:task_str_id`
Get a specific task by its string ID.

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "task_str_id": "TASK001",
  "description": "Process customer data",
  "estimated_time_minutes": 30,
  "status": "pending",
  "submitted_at": "2024-01-01T12:00:00Z"
}
```

#### `PUT /tasks/:task_str_id/status`
Update a task's status.

**Request Body:**
```json
{
  "new_status": "processing"
}
```

**Valid Status Transitions:**
- `pending` → `processing`, `completed`
- `processing` → `completed`, `pending`
- `completed` → `processing`

### Advanced Endpoints

#### `GET /tasks/next-to-process`
Get the next task to process (oldest pending task with smallest estimated time).

**Response:** Single task object or 404 if no pending tasks.

#### `GET /tasks/pending`
Get pending tasks with sorting and pagination.

**Query Parameters:**
- `sort_by`: `estimated_time_minutes` or `submitted_at` (default: `submitted_at`)
- `order`: `asc` or `desc` (default: `asc`)
- `limit`: integer (default: 10)

**Example:** `GET /tasks/pending?sort_by=estimated_time_minutes&order=asc&limit=5`

## Database Schema

The `tasks` table includes:
- `id`: UUID primary key
- `task_str_id`: Unique string identifier
- `description`: Task description
- `estimated_time_minutes`: Positive integer
- `status`: One of 'pending', 'processing', 'completed'
- `submitted_at`: Timestamp (auto-set)

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error type",
  "details": ["Specific error message"]
}
```

## Performance Features

- Optimized database indexes for fast queries
- Efficient sorting for next-to-process logic
- Proper validation to prevent invalid operations
- Status transition validation to maintain data integrity

## Testing

Use the health check endpoint to verify the API is running:
```bash
curl http://localhost:3000/health
```

### Example API Usage

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"task_str_id":"TASK001","description":"Process data","estimated_time_minutes":30}'

# Get next task to process
curl http://localhost:3000/tasks/next-to-process

# Update task status
curl -X PUT http://localhost:3000/tasks/TASK001/status \
  -H "Content-Type: application/json" \
  -d '{"new_status":"processing"}'

# Get pending tasks
curl "http://localhost:3000/tasks/pending?sort_by=estimated_time_minutes&order=asc&limit=5"
```

## Architecture

- **Modular Design**: Separate services, routes, and middleware
- **Validation**: Comprehensive input validation
- **Error Handling**: Consistent error responses
- **Database**: Efficient queries with proper indexing
- **Security**: Row Level Security enabled on database