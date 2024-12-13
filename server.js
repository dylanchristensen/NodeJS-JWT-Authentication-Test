const express = require('express');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
  next();
});

const PORT = 3000;
const secretKey = 'My super secret key';
const jwtMW = exjwt({
  secret: secretKey,
  algorithms: ['HS256'],
});

let users = [
  { id: 1, username: 'dylan', password: '123' },
  { id: 2, username: 'christensen', password: '321' }
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  for (let user of users) {
    if (username == user.username && password == user.password) {
      let token = jwt.sign(
        { id: user.id, username: user.username },
        secretKey,
        { expiresIn: '3m' } // Token expires in 3 minutes
      );

      return res.json({
        success: true,
        err: null,
        token,
      });
    }
  }

  res.status(401).json({
    success: false,
    token: null,
    err: 'Username or password is incorrect',
  });
});

app.get('/api/dashboard', jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: 'Secret content that only logged-in people can see!!!',
  });
});

// New settings route (protected by JWT)
app.get('/api/settings', jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: 'Welcome to the Settings page. Only authenticated users can access this!',
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      err,
    });
  } else {
    next(err);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
