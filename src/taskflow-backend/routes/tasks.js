const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to format task data for frontend
const formatTaskForResponse = (task) => {
  return {
    ...task,
    dueDate: task.due_date,
    // Remove the database field name
    due_date: undefined
  };
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - list_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated task ID
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         completed:
 *           type: boolean
 *           description: Task completion status
 *         list_id:
 *           type: integer
 *           description: ID of the list this task belongs to
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Task priority
 *         due_date:
 *           type: string
 *           format: date-time
 *           description: Task due date
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         due_date:
 *           type: string
 *           format: date-time
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         due_date:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/tasks/list/{listId}:
 *   get:
 *     summary: Get all tasks for a specific list
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: integer
 *         description: List ID
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: List not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Get all tasks for a specific list
router.get('/list/:listId', auth, async (req, res) => {
  try {
    // Verify that the list belongs to the user
    const list = await db.get(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [req.params.listId, req.user.id]
    );

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const tasks = await db.all(
      'SELECT * FROM tasks WHERE list_id = ? AND user_id = ? ORDER BY created_at DESC',
      [req.params.listId, req.user.id]
    );

    // Format tasks for frontend
    const formattedTasks = tasks.map(formatTaskForResponse);

    res.json(formattedTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all user's tasks with list information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Task'
 *                   - type: object
 *                     properties:
 *                       list:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           color:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Get all tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await db.all(`
      SELECT t.*, l.title as list_title, l.color as list_color 
      FROM tasks t 
      JOIN lists l ON t.list_id = l.id 
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC
    `, [req.user.id]);

    // Transform the data to match the expected format
    const formattedTasks = tasks.map(task => {
      const formattedTask = formatTaskForResponse(task);
      return {
        ...formattedTask,
        list: {
          _id: task.list_id,
          title: task.list_title,
          color: task.list_color
        }
      };
    });

    res.json(formattedTasks);
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details with list information
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Task'
 *                 - type: object
 *                   properties:
 *                     list:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         color:
 *                           type: string
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Get a specific task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await db.get(`
      SELECT t.*, l.title as list_title, l.color as list_color 
      FROM tasks t 
      JOIN lists l ON t.list_id = l.id 
      WHERE t.id = ? AND t.user_id = ?
    `, [req.params.id, req.user.id]);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Format the response
    const formattedTask = formatTaskForResponse(task);
    const responseTask = {
      ...formattedTask,
      list: {
        _id: task.list_id,
        title: task.list_title,
        color: task.list_color
      }
    };

    res.json(responseTask);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CreateTaskRequest'
 *               - type: object
 *                 required:
 *                   - list_id
 *                 properties:
 *                   list_id:
 *                     type: integer
 *                     description: ID of the list to add the task to
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request
 *       404:
 *         description: List not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Create a new task
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('title').isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('listId').isNumeric().withMessage('Valid list ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('dueDate').optional().custom((value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Allow empty values
    }
    if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('Due date must be in YYYY-MM-DD format');
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Due date must be a valid date');
    }
    if (date < new Date(new Date().toDateString())) {
      throw new Error('Due date cannot be in the past');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, listId, priority, dueDate } = req.body;

    // Verify that the list belongs to the user
    const list = await db.get(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, req.user.id]
    );

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const result = await db.run(
      'INSERT INTO tasks (title, description, list_id, user_id, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [
        title,
        description || null,
        listId,
        req.user.id,
        priority || 'medium',
        dueDate || null
      ]
    );

    // Get the created task with list info
    const newTask = await db.get(`
      SELECT t.*, l.title as list_title, l.color as list_color 
      FROM tasks t 
      JOIN lists l ON t.list_id = l.id 
      WHERE t.id = ?
    `, [result.id]);

    // Format the response
    const formattedTask = formatTaskForResponse(newTask);
    const responseTask = {
      ...formattedTask,
      list: {
        _id: newTask.list_id,
        title: newTask.list_title,
        color: newTask.list_color
      }
    };

    res.status(201).json(responseTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Task'
 *                 - type: object
 *                   properties:
 *                     list:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         color:
 *                           type: string
 *       404:
 *         description: Task not found
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Update a task
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('title').optional().isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('dueDate').optional().custom((value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Allow empty values
    }
    if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('Due date must be in YYYY-MM-DD format');
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Due date must be a valid date');
    }
    if (date < new Date(new Date().toDateString())) {
      throw new Error('Due date cannot be in the past');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, priority, completed, dueDate } = req.body;

    // Build update fields
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(priority);
    }
    if (completed !== undefined) {
      updateFields.push('completed = ?');
      updateValues.push(completed ? 1 : 0);
    }
    if (dueDate !== undefined) {
      updateFields.push('due_date = ?');
      updateValues.push(dueDate || null);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(req.params.id, req.user.id);

    const result = await db.run(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get the updated task with list info
    const updatedTask = await db.get(`
      SELECT t.*, l.title as list_title, l.color as list_color 
      FROM tasks t 
      JOIN lists l ON t.list_id = l.id 
      WHERE t.id = ?
    `, [req.params.id]);

    // Format the response
    const formattedTask = formatTaskForResponse(updatedTask);
    const responseTask = {
      ...formattedTask,
      list: {
        _id: updatedTask.list_id,
        title: updatedTask.list_title,
        color: updatedTask.list_color
      }
    };

    res.json(responseTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.run(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
