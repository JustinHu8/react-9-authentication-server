// server.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // [COOKIE] Using cookie-parser to parse cookies

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Mock user data
const users = [
    {id: 1, username: 'student', password: 'password'},
    {id: 2, username: 'admin', password: 'password'},
];

// Allow credentials and CORS setup
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, // [COOKIE] Allow cookies to be sent from the client
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

    // [COOKIE] Set the token in an HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Set to true if using HTTPS
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
    });

    res.json({ message: 'Login successful' });
});

// Logout route to clear the cookie
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
});

app.get('/protected', (req, res) => {
    // [COOKIE] Get the token from the cookie
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify the token
        const payload = jwt.verify(token, JWT_SECRET);
        res.json({ message: 'You are authorized' });
    } catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
