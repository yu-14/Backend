// Validation middleware for request data
export function validateCreateTask(req, res, next) {
  const { task_str_id, description, estimated_time_minutes } = req.body;
  
  const errors = [];
  
  // Validate task_str_id
  if (!task_str_id || typeof task_str_id !== 'string' || task_str_id.trim().length === 0) {
    errors.push('task_str_id is required and must be a non-empty string');
  }
  
  // Validate description
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('description is required and must be a non-empty string');
  }
  
  // Validate estimated_time_minutes
  if (!estimated_time_minutes || typeof estimated_time_minutes !== 'number' || estimated_time_minutes <= 0) {
    errors.push('estimated_time_minutes is required and must be a positive integer');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
}

export function validateStatusUpdate(req, res, next) {
  const { new_status } = req.body;
  const validStatuses = ['pending', 'processing', 'completed'];
  
  if (!new_status || !validStatuses.includes(new_status)) {
    return res.status(400).json({
      error: 'Invalid status',
      details: [`new_status must be one of: ${validStatuses.join(', ')}`]
    });
  }
  
  next();
}

export function validateQueryParams(req, res, next) {
  const { sort_by, order, limit } = req.query;
  
  // Validate sort_by
  if (sort_by && !['estimated_time_minutes', 'submitted_at'].includes(sort_by)) {
    return res.status(400).json({
      error: 'Invalid sort_by parameter',
      details: ['sort_by must be either "estimated_time_minutes" or "submitted_at"']
    });
  }
  
  // Validate order
  if (order && !['asc', 'desc'].includes(order)) {
    return res.status(400).json({
      error: 'Invalid order parameter',
      details: ['order must be either "asc" or "desc"']
    });
  }
  
  // Validate limit
  if (limit && (isNaN(limit) || parseInt(limit) <= 0)) {
    return res.status(400).json({
      error: 'Invalid limit parameter',
      details: ['limit must be a positive integer']
    });
  }
  
  next();
}