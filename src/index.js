import express from 'express';
import {config} from './config.js';

const PORT= config.PORT;

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login', (req, res) => {
  res.send('Login endpoint');
});

app.post('/register', (req, res) => {
  res.send('Register endpoint');
});
app.post('/logout', (req, res) => {
  res.send('Logout endpoint');
});

app.post('/protected', (req, res) => {
  res.send('Register endpoint');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
