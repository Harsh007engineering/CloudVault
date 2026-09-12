const express = require('express');
const fileController = require('../controllers/fileController');
const { authenticateUser, checkForcePasswordChange } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

// All file endpoints require an authenticated session and no pending password change
router.use(authenticateUser);
router.use(checkForcePasswordChange);

// File management routes
router.post('/upload', upload.array('files', 10), fileController.uploadFiles);
router.get('/', fileController.getFiles);
router.get('/:id', fileController.getFile);
router.get('/:id/download', fileController.downloadFile);
router.patch('/:id', fileController.renameFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
