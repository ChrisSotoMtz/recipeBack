var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
    enum: ["user", "admin"]
  }
});

const user = mongoose.model('user', userschema);
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/login', async(req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  const existingUser = await user.findOne({ email: username });
  var userdata = username;
  if (user && bcrypt.compareSync(password, existingUser.password)) {
    // create a token
    const token = jwt.sign({ username }, process.env.JWTKEY, { expiresIn: '1h' });

    res.json({ token, userdata });
  } else {
    res.status(401).send('Unauthorized');
  }
});
router.post('/signup',async(req, res) => {
  // Recover data from body
  const { username, email, password,role} = req.body;
  const hash = bcrypt.hashSync(password, salt);

  const userdata = {name:username, email:email, password:hash , role:role}
  // Verify that all fields are present
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  const existingUser = await user.findOne({ email: email });
  if (existingUser) {
    return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
  }
  // En un escenario real, aquí deberías almacenar el usuario en una base de datos
  // y realizar la lógica de hash y sal para la contraseña
  createUser(userdata)
  // Crear un token JWT
  const token = jwt.sign({ username, email }, process.env.JWTKEY, { expiresIn: '1h' });

  // Enviar el token como respuesta
  res.json({ token, username, email});
});

router.get('/role/:id', async (req, res) => {
  const { id } = req.params;
  const existingUser = await user.findOne({ email: id });
  res.json( existingUser?.role);
}); 

const createUser = async (userdata) => {
  const newUser = new user(userdata);
  await newUser.save();
}

module.exports = router;
