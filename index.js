const express = require('express');
const app = express();
const dotenv = require("dotenv");
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const route = require('./src/Routes/router');
app.use(morgan('dev'));
dotenv.config();

// DATABASE CONNECTION
mongoose
    .connect(process.env.DATABASE , {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('MongoDB Is Connected To Hiclousia');
    })
    .catch((err) => console.log(err));

app.use( cors());
app.use(express.json());
app.use('/', route);
// PORT
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`server running On port ${port}`);
});
