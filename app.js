const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes/routes');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use('', routes);
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

module.exports = app;
