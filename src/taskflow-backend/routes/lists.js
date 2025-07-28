const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     List:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated list ID
 *         name:
 *           type: string
 *           description: List name
 *         description:
 *           type: string
 *           description: List description
 *         user_id:
 *           type: integer
 *           description: ID of the user who owns the list
 *         created_at:
 *           type: string
 *           format: date-time
 *     CreateListRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     UpdateListRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /api/lists:
 *   get:
 *     summary: Get all lists for the authenticated user
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's lists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/List'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Get all lists for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const lists = await db.all(
      'SELECT * FROM lists WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(lists);
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/lists/{id}:
 *   get:
 *     summary: Get a specific list by ID
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: List ID
 *     responses:
 *       200:
 *         description: List details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       404:
 *         description: List not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Get a specific list
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await db.get(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.json(list);
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/lists:
 *   post:
 *     summary: Create a new list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListRequest'
 *     responses:
 *       201:
 *         description: List created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Create a new list
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('title').isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, color } = req.body;

    const result = await db.run(
      'INSERT INTO lists (title, description, color, user_id) VALUES (?, ?, ?, ?)',
      [title, description || null, color || '#007bff', req.user.id]
    );

    const newList = await db.get('SELECT * FROM lists WHERE id = ?', [result.id]);
    res.status(201).json(newList);
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/lists/{id}:
 *   put:
 *     summary: Update a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: List ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateListRequest'
 *     responses:
 *       200:
 *         description: List updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       404:
 *         description: List not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Update a list
router.put('/:id', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('title').isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, color } = req.body;

    const result = await db.run(
      'UPDATE lists SET title = ?, description = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [title, description || null, color || '#007bff', req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'List not found' });
    }

    const updatedList = await db.get('SELECT * FROM lists WHERE id = ?', [req.params.id]);
    res.json(updatedList);
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a list
router.delete('/:id', auth, async (req, res) => {
  try {
    // First check if list exists and belongs to user
    const list = await db.get(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Delete all tasks in this list first (SQLite will handle this with CASCADE)
    await db.run('DELETE FROM tasks WHERE list_id = ?', [req.params.id]);

    // Delete the list
    await db.run('DELETE FROM lists WHERE id = ?', [req.params.id]);

    res.json({ message: 'List and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/lists/{id}:
 *   delete:
 *     summary: Delete a list and all associated tasks
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: List ID
 *     responses:
 *       200:
 *         description: List deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: List not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

module.exports = router;
