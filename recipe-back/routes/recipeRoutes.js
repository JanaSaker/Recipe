const express = require('express');
const multer = require('multer');
const authenticateToken = require('../middleware/auth');
const recipeController = require('../controllers/recipeController');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Route definitions using controller
router.post('/', authenticateToken, upload.single('image'), recipeController.createRecipe);
router.get('/', authenticateToken, recipeController.getRecipes);
router.get('/:id', authenticateToken, recipeController.getRecipeById);
router.put('/:id', authenticateToken, upload.single('image'), recipeController.updateRecipe);
router.delete('/:id', authenticateToken, recipeController.deleteRecipe);
router.post('/ai-search', authenticateToken, recipeController.aiSearch);


module.exports = router;
