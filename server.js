// server.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Mock user data
const users = [
    {id: 1, username: 'student', password: 'password'},
    {id: 2, username: 'admin', password: 'password'},
];

app.use(cors({
    origin: 'http://localhost:5173',
}));

// Login route to issue a token
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({message: 'Invalid username or password'});
    }

    // Sign a JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

app.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the user already exists
    const userExists = users.find(u => u.username === username);
    if (userExists) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    // Add the new user
    const newUser = {
        id: users.length + 1,
        username,
        password, // Note: Hash passwords in real-world applications
        email,
    };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
