'use strict'

const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const port = 3200 || process.env.PORT;

//Importación de las Rutas//
const typeLaboratoryRoutes = require('../src/routes/typeLaboratory.routes');
const specialityRoutes = require('../src/routes/speciality.routes');
const userRoutes = require('../src/routes/user.routes');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(helmet({}));
app.use(cors());

app.use('/typeLaboratory', typeLaboratoryRoutes);
app.use('/speciality', specialityRoutes);
app.use('/user', userRoutes);

exports.initServer = ()=> app.listen(port, async ()=>
{
    console.log(`Listening on port ${port}`)
});
