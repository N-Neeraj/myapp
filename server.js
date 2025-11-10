const express = require('express');
const app = express();
app.get('/', (_req, res) => res.send('CI/CD Deployment Successful!'));
app.listen(3000, () => console.log('Running on port 3000'));
