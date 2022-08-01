'use strict'

const User = require('../models/user.model');
const Doctor = require('../models/doctor.model')
const Appointment = require('../models/appointment.model');
const Prescription = require('../models/prescription.model');

const { checkUpdate, checkUpdateAdmin, validateData, encrypt, 
    checkPassword, checkPermission,  validExtension} = require('../utils/validate');
const jwt = require('../services/jwt');

//Connect Multiparty Upload Image//
const fs = require('fs');
const path = require('path');

////////////////////////////////// FUNCIONES PUBLICAS /////////////////////////////////////////

//Función de Testeo//
exports.userTest = async (req, res) => {
    return res.send({ message: 'Función de testeo -Usuario- funciona correctamente.' });
}


//Función de Registro//
exports.register = async (req, res) => {
    try {
        const params = req.body;
        let data =
        {
            name: params.name,
            username: params.username,
            email: params.email,
            gender: params.gender,
            password: params.password,
            role: 'PACIENTE'
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        let alreadyUsername = await User.findOne({ username: data.username });
        if (alreadyUsername) return res.status(400).send({ message: 'El nombre de Usuario ya tiene una cuenta.' });

        let alreadyEmail = await User.findOne({ email: data.email });
        if (alreadyEmail) return res.status(400).send({ message: 'El correo electrónico ya tiene una cuenta.' });

        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) {
            data.NIT = 'C/F'
        }
        else {
            data.NIT = params.NIT
        }

        const correctionGender = params.gender.toUpperCase();
        if (correctionGender === 'MALE') {
            data.gender = 'MALE'
        } else if (correctionGender === 'FEMALE') {
            data.gender = 'FEMALE'
        } else {
            return res.status(400).send({ message: 'Género inválido.' })
        }

        data.DPI = params.DPI;
        data.phone = params.phone;
        data.surname = params.surname;
        data.password = await encrypt(params.password);

        let user = new User(data);
        await user.save();
        let userExist = await User.findOne({ _id: user._id })
        return res.send({ message: 'Usuario registrado exitosamente.', userExist });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al registrar al Usuario.' });
    }
}


//Función Iniciar Sesión//
exports.login = async (req, res) => {
    try {
        const params = req.body;
        let data =
        {
            identifier: params.identifier,
            password: params.password
        }
        let msg = validateData(data);

        if (msg) return res.status(400).send(msg);
        let alreadyByUsername = await User.findOne({ username: params.identifier });

        let alreadyByEmail = await User.findOne({ email: params.identifier });

        let alreadyDoctorByUsername = await Doctor.findOne({ username: params.identifier });

        let alreadyDoctorByEmail = await Doctor.findOne({ email: params.identifier });

        if ((alreadyByUsername && await checkPassword(data.password, alreadyByUsername.password)) ||
            (alreadyDoctorByUsername && await checkPassword(data.password, alreadyDoctorByUsername.password)) ||
            (alreadyByEmail && await checkPassword(data.password, alreadyByEmail.password)) ||
            (alreadyDoctorByEmail && await checkPassword(data.password, alreadyDoctorByEmail.password))) {

            let userExist;
            if (alreadyByUsername) userExist = alreadyByUsername;

            if (alreadyByEmail) userExist = alreadyByEmail;

            if (alreadyDoctorByUsername) userExist = alreadyDoctorByUsername;

            if (alreadyDoctorByEmail) userExist = alreadyDoctorByEmail;

            let token = await jwt.createToken(userExist);
            delete userExist.password

            return res.send({ message: 'Sesión iniciada.', userExist, token });
        } else return res.status(401).send({ message: 'Credenciales incorrectas.' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Iniciar Sesión.' });
    }
}


////////////////////////////////// FUNCIONES PRIVADAS (PACIENTE) /////////////////////////////////////////


//Función Eliminar Cuenta//
exports.deleteAccount = async (req, res) => {
    try {
        const userID = req.params.id;
        const params = req.body;
        const data =
        {
            password: params.password
        }
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        const persmission = await checkPermission(userID, req.user.sub);
        if (persmission === false) return res.status(403).send({ message: 'No posees los permisos para eliminar la Cuenta.' });

        const userExist = await User.findOne({ _id: userID });

        if (userExist && await checkPassword(data.password, userExist.password)) {
            const appointmentsExist = await Appointment.find({ pacient: userID });
            for (let appointmentDeleted of appointmentsExist) {
                const appointmentDeleted = await Appointment.findOneAndDelete({ pacient: userID });
            }

            const prescriptionsExist = await Prescription.find({ pacient: userID });
            for (let prescriptionDeleted of prescriptionsExist) {
                const prescriptionDeleted = await Prescription.findOneAndDelete({ pacient: userID });
            }

            const userDeleted = await User.findOneAndDelete({ _id: userID })
            if (userDeleted) return res.send({ message: 'Su cuenta ha sido eliminada exitosamente.', userDeleted });
            return res.send({ message: 'Usuario no encontrado o ya esta elimnado.' });
        }

        return res.status(400).send({ message: 'La contraseña es incorrecta.' });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al eliminar la Cuenta.' });
    }
}


//Función Actualizar Cuenta//
exports.updateAccount = async (req, res) => {
    try {
        const userID = req.params.id;
        const params = req.body;

        const permission = await checkPermission(userID, req.user.sub);
        if (permission === false) return res.status(401).send({ message: 'No posees los permisos para actualizar la Cuenta.' });

        const userExist = await User.findOne({ _id: userID });
        if (!userExist) return res.send({ message: 'Usuario no Encontrado.' });

        const validateUpdate = await checkUpdate(params);
        if (validateUpdate === false) return res.status(400).send({ message: 'No puedes actualizar con estos datos.' });

        let alreadyUsername = await User.findOne({ username: params.username });
        if (alreadyUsername && userExist.username != params.username)
            return res.status(400).send({ message: 'El nombre de Usuario ya está en uso.' });

        let alreadyEmail = await User.findOne({ email: params.email });
        if (alreadyEmail && userExist.email != params.email)
            return res.status(400).send({ message: 'El email ya está en uso.' });

        let alreadyDPI = await User.findOne({ DPI: params.DPI });
        if (alreadyDPI && userExist.DPI != params.DPI && params.DPI != null)
            return res.status(400).send({ message: 'El DPI ya está en uso.' });

        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) {
            params.NIT = 'C/F'
        }
        else {
            params.NIT = params.NIT
        }

        if (params.gender) {
            const correctionGender = params.gender.toUpperCase();
            if (correctionGender === 'MALE') {
                params.gender = 'MALE'
            } else if (correctionGender === 'FEMALE') {
                params.gender = 'FEMALE'
            } else {
                return res.status(400).send({ message: 'Género inválido.' })
            }
        }

        const userUpdate = await User.findOneAndUpdate({ _id: userID }, params, { new: true });
        if (userUpdate)
            return res.send({ message: 'Cuenta actualizada exitosamente.', userUpdate });
        return res.send({ message: 'Cuenta no actualizada.' });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al actualizar la Cuenta.' });
    }
}

//Función Obtener Usuario// 
exports.getUser = async (req, res) => {
    try {
        const idLoggued = req.user.sub;
        const userID = req.params.id;
        const role = await User.findOne({ _id: idLoggued });
        const doctorRole = await Doctor.findOne({ _id: idLoggued });

        const roleUser = await User.findOne({ _id: userID });

        if (role && role.role === 'PACIENTE') {
            const user = await User.findOne({ _id: idLoggued });
            if (!user)
                return res.status(400).send({ message: 'Usuario no encontrado.' })
            return res.send({ message: 'Usuario encontrado:', user });
        }
        if (roleUser && doctorRole && doctorRole.role === 'DOCTOR') {
            const user = await User.findOne({ _id: userID });
            if (!user)
                return res.status(400).send({ message: 'Usuario no encontrado.' })
            return res.send({ message: 'Usuario encontrado:', user });
        }
        if (doctorRole && doctorRole.role === 'DOCTOR') {
            const user = await Doctor.findOne({ _id: idLoggued });
            if (!user)
                return res.status(400).send({ message: 'Doctor no encontrado.' })
            return res.send({ message: 'Doctor encontrado:', user });
        }
        if (role && role.role === 'ADMIN') {
            const user = await User.findOne({ _id: userID });
            if (!user)
                return res.status(400).send({ message: 'Usuario no encontrado.' })
            return res.send({ message: 'Usuario encontrado:', user });
        } else {
            return res.status(400).send({ message: 'Usuario no encontrado.' })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener al Usuario.' });
    }
}

////////////////////////////////// FUNCIONES PRIVADAS (ADMIN) /////////////////////////////////////////

//Función Agregar Usuario// 
exports.saveUser = async (req, res) => {
    try {
        const params = req.body;
        let data =
        {
            name: params.name,
            username: params.username,
            DPI: params.DPI,
            email: params.email,
            phone: params.phone,
            age: params.age,
            password: params.password,
            gender: params.gender,
            role: 'PACIENTE'
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        let alreadyUsername = await User.findOne({ username: data.username });
        if (alreadyUsername) return res.status(400).send({ message: 'El nombre de Paciente ya tiene una cuenta.' });

        let alreadyEmail = await User.findOne({ email: data.email });
        if (alreadyEmail) return res.status(400).send({ message: 'El correo electrónico ya tiene una cuenta.' });

        let alreadyDPI = await User.findOne({ DPI: data.DPI });
        if (alreadyDPI) return res.status(400).send({ message: 'El DPI ya fué registrado.' });

        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) {
            data.NIT = 'C/F'
        }
        else {
            data.NIT = params.NIT
        }

        const correctionGender = params.gender.toUpperCase();
        if (correctionGender === 'MALE') {
            data.gender = 'MALE'
        } else if (correctionGender === 'FEMALE') {
            data.gender = 'FEMALE'
        } else {
            return res.status(400).send({ message: 'Género inválido.' })
        }

        data.surname = params.surname;
        data.password = await encrypt(params.password);

        let user = new User(data);
        await user.save();
        let userExist = await User.findOne({ _id: user._id })
        return res.send({ message: 'Paciente registrado exitosamente.', userExist });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al registrar al Paciente.' });
    }
}

//Función Actualizar Usuario//
exports.updateUser = async (req, res) => {
    try {
        const userID = req.params.id;
        const params = req.body;

        const userExist = await User.findOne({ _id: userID });
        if (!userExist) return res.status(400).send({ message: 'Usuario no Encontrado' });

        const emptyParams = await checkUpdateAdmin(params);
        if (emptyParams === false) return res.status(400).send({ message: 'Parametros vacios o no se pueden utilizar.' });

        if (userExist.role === 'ADMIN')
            return res.send({ message: 'No se puede actualizar al Administrador.' });

        let alreadyUsername = await User.findOne({ username: params.username });
        if (alreadyUsername && userExist.username != params.username)
            return res.status(400).send({ message: 'El nombre de Usuario ya está en uso.' });

        let alreadyEmail = await User.findOne({ email: params.email });
        if (alreadyEmail && userExist.email != params.email)
            return res.status(400).send({ message: 'El email ya está en uso.' });

        let alreadyDPI = await User.findOne({ DPI: params.DPI });
        if (alreadyDPI && userExist.DPI != params.DPI && params.DPI != null)
            return res.status(400).send({ message: 'El DPI ya está en uso.' });

        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) {
            params.NIT = 'C/F'
        }
        else {
            params.NIT = params.NIT
        }

        if (params.gender) {
            const correctionGender = params.gender.toUpperCase();
            if (correctionGender === 'MALE') {
                params.gender = 'MALE'
            } else if (correctionGender === 'FEMALE') {
                params.gender = 'FEMALE'
            } else {
                return res.status(400).send({ message: 'Género inválido.' })
            }
        }

        const userUpdate = await User.findOneAndUpdate({ _id: userID }, params, { new: true });
        if (userUpdate)
            return res.send({ message: 'Usuario actualizado exitosamente.', userUpdate });
        return res.status(400).send({ message: 'Usuario no actualizado.' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al actualizar al Usuario.' });
    }
}

//Función Eliminar Usuario//
exports.deleteUser = async (req, res) => {
    try {
        const userID = req.params.id;
        const params = req.body

        const adminId = req.user.sub;

        const data = {
            password: params.password
        }

        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        const userExist = await User.findOne({ _id: userID });
        if (!userExist) return res.status(400).send({ message: 'Usuario no encontrado o ya esta eliminado.' })

        const admin = await User.findOne({ _id: adminId });

        if (userExist && await checkPassword(data.password, admin.password)) {

            if (userExist.role == 'ADMIN')
                return res.send({ message: 'No se puede eliminar al Administrador.' });

            const appointmentsExist = await Appointment.find({ pacient: userID });

            for (let appointmentDeleted of appointmentsExist) {
                const appointmentDeleted = await Appointment.findOneAndDelete({ pacient: userID });
            }

            const prescriptionsExist = await Prescription.find({ pacient: userID });
            for (let prescriptionDeleted of prescriptionsExist) {
                const prescriptionDeleted = await Prescription.findOneAndDelete({ pacient: userID });
            }

            const userDeleted = await User.findOneAndDelete({ _id: userID })
            if (userDeleted) return res.send({ message: 'Usuario eliminado exitosamente.', userDeleted });
            return res.send({ message: 'Usuario no encontrado o ya esta Eliminado.' });
        }
        return res.status(400).send({ message: 'Contraseña incorrecta.' });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al eliminar la Cuenta.' });
    }
}


//Función Buscar Usuario// 
exports.searchUser = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            username: params.username
        }

        const msg = validateData(data);

        if (!msg) {
            const user = await User.find({ username: { $regex: params.username, $options: 'i' } });
            return res.send({ message: 'Usuario: ', user });

        } else return res.status(400).send(msg);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error buscando al Usuario', err });
    }
}

//Función Obtener Usuarios//
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'PACIENTE' });
        if (!users) return res.status(400).send({ message: 'No existen Pacientes.' })
        return res.send({ message: 'Pacientes: ', users });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo Pacientes.', err });
    }
}

//Obtener Usuarios por el nombre
exports.getUsuariosByName = async (req, res)=>{
    try{
        const params = req.body;
        const data ={
            name: params.name
        }
        const users = await User.find({name: {$regex: params.name, $options:'i'}});
        return res.send({message:'Usuarios encontrados: ', users});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error encontrando Usuarios.', err});
    }
}

// Obtener Usuarios ordenado de A a Z
exports.getUsuariosAtoZ = async (req, res) => {
    try {
        const UsuariosAtoZ = await User.find({name:{$ne:'SuperAdmin'}});
        if (UsuariosAtoZ.length === 0) return res.send({ message: 'Usuarios no encontrados.' })
        UsuariosAtoZ.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (b.name > a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Usuarios encontrados:', UsuariosAtoZ })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener los Doctores.' });
    }
}


// Obtener Usuarios ordenado de Z a A
exports.getUsuariosZtoA = async (req, res) => {
    try {
        const UsuariosZtoA = await User.find({name:{$ne:'SuperAdmin'}});
        if (UsuariosZtoA.length === 0) return res.send({ message: 'Usuarios no encontrados.' })
        UsuariosZtoA.sort((a, b) => {
            if (a.name > b.name) {
                return -1;
            } else if (b.name < a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Usuarios encontrados:', UsuariosZtoA })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener los Doctores.' });
    }
}

//IMPLEMENTACIÓN DE IMÁGENES//
exports.addImageUser=async(req,res)=>
{
    try
    {
        const userID = req.params.id;

        const permission = await checkPermission(userID, req.user.sub);
        if(permission === false) return res.status(401).send({message: 'No posees los permisos necesarios.'});
        const alreadyImage = await User.findOne({_id: req.user.sub});
        let pathFile = './uploads/users/';
        if(alreadyImage.image) fs.unlinkSync(pathFile+alreadyImage.image);
        if(!req.files.image || !req.files.image.type) return res.status(400).send({message: 'No se pudo agregar la imagen.'});
        
        const filePath = req.files.image.path; 
       
        const fileSplit = filePath.split('\\'); 
        const fileName = fileSplit[2]; 

        const extension = fileName.split('\.'); 
        const fileExt = extension[1]; 

        const validExt = await validExtension(fileExt, filePath);
        if(validExt === false) return res.status(400).send('Tipo de archivo no válido.');
        const updateUser = await User.findOneAndUpdate({_id: req.user.sub}, {image: fileName}, {new: true}).lean();        if(!updateUser) return res.status(404).send({message: 'Usuario no encontrado.'});
        if(!updateUser) return res.status(404).send({message: 'Usuario no existente.'});
        delete updateUser.password;
        return res.send(updateUser);
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al asignarle una imagen al Usuario.'});
    }
}

exports.getImageUser = async(req, res)=>
{
    try
    {
        const fileName = req.params.fileName;
        const pathFile = './uploads/users/' + fileName;

        const image = fs.existsSync(pathFile);
        if(!image) return res.status(404).send({message: 'Imagen no existente.'});
        return res.sendFile(path.resolve(pathFile));
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al obtener la imagen del Usuario.'});
    }
}

exports.getUsersAndDoctors = async (req, res) => {
    try {
        const users = await User.find({role:'PACIENTE'});
        const doctors = await Doctor.find();

        let array = [
            {name:'PACIENTE', value:users.length},
            {name:'DOCTOR', value:doctors.length},
        ]

        return res.send({array})
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo Pacientes.', err });
    }
}