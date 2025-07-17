import express from 'express';
import { TaskService } from '../services/taskService.js';
import { validateCreateTask, validateStatusUpdate, validateQueryParams } from '../middleware/validation.js';

const router = express.Router();

// POST /tasks - Create a new task
router.post('/', validateCreateTask, async (req, res) => {
  try {
    const result = await TaskService.createTask(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        error: 'Task creation failed',
        details: [error.message]
      });
    }
    
    console.error('Error creating task:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: ['Failed to create task']
    });
  }
});

// GET /tasks/next-to-process - Get next task to process
router.get('/next-to-process', async (req, res) => {
  try {
    const task = await TaskService.getNextTaskToProcess();
    
    if (!task) {
      return res.status(404).json({
        error: 'No pending tasks found',
        details: ['No tasks with pending status available']
      });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error getting next task:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: ['Failed to retrieve next task']
    });
  }
});

// GET /tasks/pending - Get pending tasks with sorting and pagination
router.get('/pending', validateQueryParams, async (req, res) => {
  try {
    const options = {
      sort_by: req.query.sort_by || 'submitted_at',
      order: req.query.order || 'asc',
      limit: req.query.limit || 10
    };
    
    const tasks = await TaskService.getPendingTasks(options);
    res.json(tasks);
  } catch (error) {
    console.error('Error getting pending tasks:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: ['Failed to retrieve pending tasks']
    });
  }
});

// GET /tasks/:task_str_id - Get specific task by string ID
router.get('/:task_str_id', async (req, res) => {
  try {
    const task = await TaskService.getTaskByStrId(req.params.task_str_id);
    
    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        details: [`Task with ID '${req.params.task_str_id}' does not exist`]
      });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: ['Failed to retrieve task']
    });
  }
});

// PUT /tasks/:task_str_id/status - Update task status
router.put('/:task_str_id/status', validateStatusUpdate, async (req, res) => {
  try {
    const updatedTask = await TaskService.updateTaskStatus(
      req.params.task_str_id,
      req.body.new_status
    );
    
    if (!updatedTask) {
      return res.status(404).json({
        error: 'Task not found',
        details: [`Task with ID '${req.params.task_str_id}' does not exist`]
      });
    }
    
    res.json(updatedTask);
  } catch (error) {
    if (error.message.includes('Invalid status transition')) {
      return res.status(400).json({
        error: 'Invalid status transition',
        details: [error.message]
      });
    }
    
    console.error('Error updating task status:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: ['Failed to update task status']
    });
  }
});

export default router;