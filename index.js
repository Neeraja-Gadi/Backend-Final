const express = require('express');
const app = express();
const dotenv = require("dotenv");
dotenv.config();
// const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const route = require('./src/Routes/router');
// app.use(morgan('dev'));

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

app.use(
    cors({
      origin: 'http://hiclousia.com',
      methods: ['GET', 'POST', 'PUT', 'DELETE' , "PATCH"],
    })
  );
  
app.use(express.json());
app.use('/', route);
// PORT
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`server running On port ${port}`);
});
