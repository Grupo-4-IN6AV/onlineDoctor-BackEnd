'use strict'

const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const port = 3200 || process.env.PORT;

//Importación de las Rutas//
const userRoutes = require('../src/routes/user.routes');
const houseRoutes = require('../src/routes/house.routes');
const eventRoutes = require('../src/routes/event.routes');
const roomRoutes = require('../src/routes/room.routes');
const reservationRoutes = require('../src/routes/reservation.routes');
const contactRoutes = require('../src/routes/contact.routes')

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(helmet({}));
app.use(cors());

exports.initServer = ()=> app.listen(port, async ()=>
{
    console.log(`Listening on port ${port}`)
});
