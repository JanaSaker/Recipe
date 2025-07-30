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

exports.aiSearch = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    // Example flavor/ingredient keywords for basic "AI" understanding
    const flavors = ['sour', 'sweet', 'spicy', 'salty', 'bitter', 'umami'];
    const foundFlavor = flavors.find(f => prompt.toLowerCase().includes(f));

    let where = {};

    if (foundFlavor) {
      where.flavor = foundFlavor;
    } else {
      // Fallback: search in ingredients or name
      where = {
        [require('sequelize').Op.or]: [
          { ingredients: { [require('sequelize').Op.like]: `%${prompt}%` } },
          { name: { [require('sequelize').Op.like]: `%${prompt}%` } },
        ]
      };
    }

    const recipes = await require('../models/Recipe').findAll({ where });

    if (recipes.length === 0) {
      return res.json({ message: 'No recipes found matching your request.' });
    }
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
