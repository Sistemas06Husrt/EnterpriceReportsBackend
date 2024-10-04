const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const reportsRoutes = require('./routes/reportsRoutes');

//settings
app.set('port', 3003);
app.listen(3003, '0.0.0.0')
//middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(reportsRoutes);
//run
app.listen(app.get('port'), () => {
    console.log('Server Reports Backend Enterprices on Port 3003')
})

