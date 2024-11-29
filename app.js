const express = require('express');
const app = express();
const routes = require('./Routes/UserRoutes');
const port   = 3000;
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/route', routes);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});