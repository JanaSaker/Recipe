const Recipe = require('../models/recipeModel');
const { Op } = require('sequelize');

// Create recipe
exports.createRecipe = async (req, res) => {
  try {
    const { name, ingredients, instructions, cuisineType, preparationTime, status, metadata } = req.body;
    const image = req.file ? req.file.filename : null;

    const recipe = await Recipe.create({
      name,
      ingredients,
      instructions,
      cuisineType,
      preparationTime,
      status,
      metadata,
      image
    });

    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all recipes (with optional search)
exports.getRecipes = async (req, res) => {
  try {
    const { name, ingredient, cuisineType, preparationTime } = req.query;
    let where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (cuisineType) where.cuisineType = cuisineType;
    if (preparationTime) where.preparationTime = preparationTime;
    if (ingredient) where.ingredients = { [Op.like]: `%${ingredient}%` };

    const recipes = await Recipe.findAll({ where });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get recipe by id
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update recipe
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const { name, ingredients, instructions, cuisineType, preparationTime, status, metadata } = req.body;
    const image = req.file ? req.file.filename : recipe.image;

    await recipe.update({
      name, ingredients, instructions, cuisineType, preparationTime, status, metadata, image
    });

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    await recipe.destroy();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Example extended keyword dictionary
const flavorKeywords = {
  sour: ['sour', 'tangy', 'acidic', 'zesty'],
  sweet: ['sweet', 'sugary', 'dessert', 'honey'],
  spicy: ['spicy', 'hot', 'chili', 'peppery'],
  salty: ['salty', 'briny', 'savory'],
  bitter: ['bitter', 'sharp', 'harsh'],
  umami: ['umami', 'meaty', 'brothy', 'savory'],
};

// Helper to detect flavor category from prompt
function detectFlavorCategory(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  for (const [flavor, keywords] of Object.entries(flavorKeywords)) {
    if (keywords.some(word => lowerPrompt.includes(word))) {
      return flavor;
    }
  }
  return null;
}

// Basic scoring system
function scoreRecipe(recipe, prompt) {
  const text = `${recipe.name} ${recipe.ingredients}`.toLowerCase();
  const promptWords = prompt.toLowerCase().split(/\s+/);
  let score = 0;
  for (const word of promptWords) {
    if (text.includes(word)) score++;
  }
  return score;
}

exports.aiSearch = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const detectedFlavor = detectFlavorCategory(prompt);
    let whereClause;

    if (detectedFlavor) {
      whereClause = { flavor: detectedFlavor };
    } else {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${prompt}%` } },
          { ingredients: { [Op.like]: `%${prompt}%` } },
        ],
      };
    }

    const recipes = await Recipe.findAll({ where: whereClause });

    if (!recipes.length) {
      return res.status(404).json({ message: 'No matching recipes found.' });
    }

    // Apply scoring and return sorted recipes
    const scoredResults = recipes
      .map(recipe => ({ recipe, score: scoreRecipe(recipe, prompt) }))
      .sort((a, b) => b.score - a.score)
      .map(result => result.recipe);

    res.json(scoredResults);
  } catch (err) {
    console.error('AI Search Error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

