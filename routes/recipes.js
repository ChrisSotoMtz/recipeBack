var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// Definir el esquema de la receta
const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,

    },
    ingredients:
    {
        type: String,
        required: true,
    },

    instructions: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    cookingTime: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    }
});

// Create a model for recipes
const Recipe = mongoose.model('Recipe', recipeSchema);

router.post('/add', async (req, res) => {
    const { title, description ,ingredients, instructions, category, cookingTime, image, owner } = req.body;
    const recipe = { title,description, ingredients, category, cookingTime, instructions, image, owner }
    console.log('la receta es: ', recipe);
    const newRecipe = new Recipe(recipe);
    await newRecipe.save();
    res.json({ status: 'Recipe Saved' });
});


router.get('/all', async (req, res) => {
    const recipes = await Recipe.find();
    console.log(recipes);
    res.json(recipes);
});

router.get('/all/:owner', async (req, res) => {
    const recipes = await Recipe.find({ owner: req.params.owner });
    console.log(recipes);
    res.json(recipes);
});
module.exports = router;
