'use strict'

const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const port = 3200 || process.env.PORT;

//Importación de Encriptado//
const {encrypt} = require('../src/utils/validate');

//Importación del Modelo de Usuario//
const User = require('../src/models/user.model');

//Importación de las Rutas//
const typeLaboratoryRoutes = require('../src/routes/typeLaboratory.routes');
const specialityRoutes = require('../src/routes/speciality.routes');
const userRoutes = require('../src/routes/user.routes');
const doctorRoutes = require('../src/routes/doctor.routes');
const typeMedicamentRoutes = require('../src/routes/typeMedicament.routes');
const medicamentRoutes = require('../src/routes/medicament.routes');
const appointmentRoutes = require('../src/routes/appointment.routes');
const laboratoryRoutes = require('../src/routes/laboratory.routes')

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(helmet({}));
app.use(cors());

app.use('/typeLaboratory', typeLaboratoryRoutes);
app.use('/typeMedicament', typeMedicamentRoutes);
app.use('/speciality', specialityRoutes);
app.use('/user', userRoutes);
app.use('/doctor', doctorRoutes);
app.use('/medicament', medicamentRoutes);
app.use('/appointment', appointmentRoutes);
app.use('/laboratory', laboratoryRoutes);


exports.initServer = ()=> app.listen(port, async ()=>
{
    console.log(`Listening on port ${port}.`)
    const automaticUser = 
    {
        username: 'SuperAdmin',
        name: 'SuperAdmin',
        surname: 'SuperAdmin',
        phone: 'SuperAdmin',
        email: 'admin@kinal.edu.gt',
        password: await encrypt('OnlineDoctor'),
        role: 'ADMIN'
    }

    const searchUserAdmin = await User.findOne({username:automaticUser.username});
    if(!searchUserAdmin)
    {
        let userAdmin = new User(automaticUser);
        await userAdmin.save();
        console.log('Administrador creado Exitosamente.')
    }
});
