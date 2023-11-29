var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const storage = multer.memoryStorage();
const jwt = require('jsonwebtoken');

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 50000 * 50000, // set the maximum field size in bytes
    },
});

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
router.use(authenticateJWT);
router.post('/add', upload.single('image'), async (req, res) => {
    const { title, description, ingredients, instructions, category, cookingTime, image, owner } = req.body;
    if (!title || !description || !ingredients || !instructions || !category || !cookingTime || !image || !owner) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    const recipe = { title, description, ingredients, category, cookingTime, instructions, image, owner }
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

router.get('/one/:id', async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    //console.log(recipe);
    res.json(recipe);
});

router.delete('/delete/:id', async (req, res) => {
    await Recipe.deleteOne({ _id: req.params.id });
    res.json({ status: 'Recipe Deleted' });
});

router.put('/update/:id', upload.single('image'), async (req, res) => {
    await Recipe.findByIdAndUpdate(req.params.id, req.body);
    res.json({ status: 'Recipe Updated' });
});

function authenticateJWT(req, res, next) {
    const jwtToken = req.header('Authorization');
    const token = jwtToken?.split(' ')[1];
    console.log(token);
    if (!token) {
        console.log('No token');
        return res.status(401).send('Unauthorized');
    }

    jwt.verify(token, process.env.JWTKEY, (err, user) => {
        if (err) {
            console.log('err', err);
            return res.status(403).send('Forbidden');
        }

        req.user = user;
        next();
    });
}

module.exports = router;
