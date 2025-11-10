const express = require('express');
const app = express();
app.get('/', (_req, res) => res.send('✅ CI/CD Deployment Successful! (eu-north-1)'));
app.listen(3000, () => console.log('Running on port 3000'));
