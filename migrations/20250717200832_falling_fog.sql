/*
  # Task Scheduler API Database Schema

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key, auto-generated)
      - `task_str_id` (text, unique, not null)
      - `description` (text, not null)
      - `estimated_time_minutes` (integer, > 0, not null)
      - `status` (text, enum-like with check constraint, defaults to 'pending')
      - `submitted_at` (timestamptz, auto-set on creation)

  2. Indexes
    - Index on `task_str_id` for fast lookups
    - Index on `status` for filtering
    - Composite index on `status`, `submitted_at`, and `estimated_time_minutes` for efficient sorting

  3. Constraints
    - `task_str_id` must be unique
    - `estimated_time_minutes` must be > 0
    - `status` must be one of: 'pending', 'processing', 'completed'

  4. Security
    - Enable RLS on `tasks` table
    - Allow all operations for authenticated users (API will handle auth)
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_str_id text UNIQUE NOT NULL,
  description text NOT NULL,
  estimated_time_minutes integer NOT NULL CHECK (estimated_time_minutes > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  submitted_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_task_str_id ON tasks(task_str_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status_submitted_at ON tasks(status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_tasks_status_estimated_time ON tasks(status, estimated_time_minutes);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for API access (assuming service role key usage)
CREATE POLICY "Allow all operations for service role"
  ON tasks
  FOR ALL
  TO service_role
  USING (true);

-- Create policy for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON tasks
  FOR ALL
  TO authenticated
  USING (true);