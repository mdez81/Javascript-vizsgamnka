const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const app = express();
const path = require('path');
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret_key';


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login_register'
});


app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.redirect('/login');
  });

app.get('/register', (req, res) => res.sendFile(__dirname + '/views/register.html'));
app.get('/login', (req, res) => res.sendFile(__dirname + '/views/login.html'));
app.get('/dashboard', (req, res) => res.sendFile(__dirname + '/views/dashboard.html'));

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;


    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?,?)';
    db.query(sql, [username, email, hashedPassword], (err) => {
        if (err) throw err;
        //res.send('User registered successfully!');
        res.redirect('/login');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) throw err;

        if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: results[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token }); // Send token as a response        
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
