import { supabase } from '../config/database.js';

export class TaskService {
  static checkConnection() {
    if (!supabase) {
      throw new Error('Database not configured. Please set up Supabase connection.');
    }
  }

  // Valid status transitions
  static VALID_TRANSITIONS = {
    'pending': ['processing', 'completed'],
    'processing': ['completed', 'pending'],
    'completed': ['processing'] // Allow reprocessing if needed
  };

  static async createTask(taskData) {
    this.checkConnection();
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          task_str_id: taskData.task_str_id,
          description: taskData.description,
          estimated_time_minutes: taskData.estimated_time_minutes
        }])
        .select('id, task_str_id, status')
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Task with this task_str_id already exists');
        }
        throw error;
      }

      return {
        internal_db_id: data.id,
        task_str_id: data.task_str_id,
        status: data.status
      };
    } catch (error) {
      throw error;
    }
  }

  static async getTaskByStrId(taskStrId) {
    this.checkConnection();
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('task_str_id', taskStrId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateTaskStatus(taskStrId, newStatus) {
    this.checkConnection();
    try {
      // First, get the current task to check current status
      const currentTask = await this.getTaskByStrId(taskStrId);
      
      if (!currentTask) {
        return null;
      }

      // Validate status transition
      const validNextStatuses = this.VALID_TRANSITIONS[currentTask.status];
      if (!validNextStatuses.includes(newStatus)) {
        throw new Error(`Invalid status transition from '${currentTask.status}' to '${newStatus}'`);
      }

      // Update the status
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('task_str_id', taskStrId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getNextTaskToProcess() {
    this.checkConnection();
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .order('estimated_time_minutes', { ascending: true })
        .order('submitted_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getPendingTasks(options = {}) {
    this.checkConnection();
    try {
      const {
        sort_by = 'submitted_at',
        order = 'asc',
        limit = 10
      } = options;

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending');

      // Apply sorting
      query = query.order(sort_by, { ascending: order === 'asc' });

      // Apply limit
      query = query.limit(parseInt(limit));

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }
}