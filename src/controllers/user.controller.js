'use strict'

const User = require('../models/user.model');
const Doctor = require('../models/doctor.model')
const Appointment = require('../models/appointment.model');
const Prescription = require('../models/prescription.model');

const { checkUpdate, checkUpdateAdmin, validateData, encrypt, checkPassword, checkPermission } = require('../utils/validate');
const jwt = require('../services/jwt');

////////////////////////////////// FUNCIONES PUBLICAS /////////////////////////////////////////

//Función de Testeo//
exports.userTest = async (req, res) => {
    return res.send({ message: 'Función de testeo -USUARIO- funciona correctamente' });
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
        if (alreadyUsername) return res.status(400).send({ message: 'El nombre de Usuario ya tiene una cuenta' });

        let alreadyEmail = await User.findOne({ email: data.email });
        if (alreadyEmail) return res.status(400).send({ message: 'El correo electronico ya tiene una cuenta' });

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
            return res.status(400).send({ message: 'Genero Invalido' })
        }

        data.DPI = params.DPI;
        data.phone = params.phone;
        data.surname = params.surname;
        data.password = await encrypt(params.password);

        let user = new User(data);
        await user.save();
        let userExist = await User.findOne({ _id: user._id })
        return res.send({ message: 'Usuario registrado Exitosamente', userExist });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Registrar al Usuario' });
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

            return res.send({ message: 'Sesión Iniciada', userExist, token });
        } else return res.status(401).send({ message: 'Credenciales Incorrectas' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Iniciar Sesión' });
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
        if (persmission === false) return res.status(403).send({ message: 'No posees los permisos para eliminar la Cuenta' });

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
            if (userDeleted) return res.send({ message: 'Su cuenta ha sido Eliminada Exitosamente', userDeleted });
            return res.send({ message: 'Usuario no Encontrado o ya Elimnado' });
        }

        return res.status(400).send({ message: 'La contraseña es incorrecta' });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Eliminar la Cuenta' });
    }
}


//Función Actualizar Cuenta//
exports.updateAccount = async (req, res) => {
    try {
        const userID = req.params.id;
        const params = req.body;

        const permission = await checkPermission(userID, req.user.sub);
        if (permission === false) return res.status(401).send({ message: 'No posees los permisos para actualizar la Cuenta' });

        const userExist = await User.findOne({ _id: userID });
        if (!userExist) return res.send({ message: 'Usuario no Encontrado' });

        const validateUpdate = await checkUpdate(params);
        if (validateUpdate === false) return res.status(400).send({ message: 'No puedes actualizar con estos datos' });

        let alreadyUsername = await User.findOne({ username: params.username });
        if (alreadyUsername && userExist.username != params.username)
            return res.status(400).send({ message: 'El nombre de Usuario ya está en uso' });

        let alreadyEmail = await User.findOne({ email: params.email });
        if (alreadyEmail && userExist.email != params.email)
            return res.status(400).send({ message: 'El email ya está en uso' });

        let alreadyDPI = await User.findOne({ DPI: params.DPI });
        if (alreadyDPI && userExist.DPI != params.DPI && params.DPI != null)
            return res.status(400).send({ message: 'El DPI ya está en uso' });

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
                return res.status(400).send({ message: 'Genero Invalido' })
            }
        }

        const userUpdate = await User.findOneAndUpdate({ _id: userID }, params, { new: true });
        if (userUpdate)
            return res.send({ message: 'Cuenta Actualizada Exitosamente', userUpdate });
        return res.send({ message: 'Cuenta no Actualizada' });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Actualizar la Cuenta.' });
    }
}

//Función Obtener Usuario// 
exports.getUser = async (req, res) => {
    try {
        const idLoggued = req.user.sub;
        const role = await User.findOne({ _id: idLoggued });

        if (role.role === 'PACIENTE') {
            const user = await User.find({ _id: idLoggued });
            if (!user)
                return res.status(400).send({ message: 'Usuario no Encontrado' })
            return res.send({ message: 'Usuario Encontrado:', user });
        }
        if (role.role === 'ADMIN') {
            const userID = req.params.id
            const user = await User.find({ _id: userID });
            if (!user)
                return res.status(400).send({ message: 'Usuario no Encontrado' })
            return res.send({ message: 'Usuario Encontrado:', user });
        } else {
            return res.status(400).send({ message: 'Usuario no Encontrado' })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener al Usuario.' });
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
            role: params.role
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        let alreadyUsername = await User.findOne({ username: data.username });
        if (alreadyUsername) return res.status(400).send({ message: 'El nombre de Usuario ya tiene una cuenta' });

        let alreadyEmail = await User.findOne({ email: data.email });
        if (alreadyEmail) return res.status(400).send({ message: 'El correo electronico ya tiene una cuenta' });

        let alreadyDPI = await User.findOne({ DPI: data.DPI });
        if (alreadyDPI) return res.status(400).send({ message: 'El DPI ya fué registrado' });

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
            return res.status(400).send({ message: 'Genero Invalido' })
        }

        if (params.role != 'ADMIN' && params.role != 'PACIENTE') return res.status(400).send({ message: 'Invalid role' });

        data.surname = params.surname;
        data.password = await encrypt(params.password);

        let user = new User(data);
        await user.save();
        let userExist = await User.findOne({ _id: user._id })
        return res.send({ message: 'Usuario registrado Exitosamente', userExist });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Registrar al Usuario' });
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
        if (emptyParams === false) return res.status(400).send({ message: 'Parametros vacios o no se pueden utilizar' });

        if (userExist.role === 'ADMIN')
            return res.send({ message: 'No se puede Actualizar al Administrador.' });

        let alreadyUsername = await User.findOne({ username: params.username });
        if (alreadyUsername && userExist.username != params.username)
            return res.status(400).send({ message: 'El nombre de Usuario ya está en uso' });

        let alreadyEmail = await User.findOne({ email: params.email });
        if (alreadyEmail && userExist.email != params.email)
            return res.status(400).send({ message: 'El email ya está en uso' });

        let alreadyDPI = await User.findOne({ DPI: params.DPI });
        if (alreadyDPI && userExist.DPI != params.DPI && params.DPI != null)
            return res.status(400).send({ message: 'El DPI ya está en uso' });

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
                return res.status(400).send({ message: 'Genero invalido' })
            }
        }
        if (params.role) {
            if (params.role != 'ADMIN' && params.role != 'PACIENTE') return res.status(400).send({ message: 'Invalid role' });
        }

        const userUpdate = await User.findOneAndUpdate({ _id: userID }, params, { new: true });
        if (userUpdate)
            return res.send({ message: 'Usuario Actualizado Exitosamente', userUpdate });
        return res.status(400).send({ message: 'Usuario no Actualizado' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Actualizar al Usuario' });
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
        if (!userExist) return res.status(400).send({ message: 'Usuario no Encontrado o ya Eliminado' })

        const admin = User.findOne({ _id: adminId });

        if (userExist && await checkPassword(data.password, admin.password)) {

            if (userExist.role == 'ADMIN')
                return res.send({ message: 'No se puede Eliminar al Administrador' });

            const appointmentsExist = await Appointment.find({ pacient: userID });
            for (let appointmentDeleted of appointmentsExist) {
                const appointmentDeleted = await Appointment.findOneAndDelete({ pacient: userID });
            }

            const prescriptionsExist = await Prescription.find({ pacient: userID });
            for (let prescriptionDeleted of prescriptionsExist) {
                const prescriptionDeleted = await Prescription.findOneAndDelete({ pacient: userID });
            }

            const userDeleted = await User.findOneAndDelete({ _id: userID })
            if (userDeleted) return res.send({ message: 'Usuario Eliminado Exitosamente', userDeleted });
            return res.send({ message: 'Usuario no Encontrado o ya Eliminado' });
        }
        return res.send({ message: 'Usuario no Encontrado o ya Eliminado' });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Eliminar la Cuenta' });
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
        return res.status(500).send({ message: 'Error buscando usuario', err });
    }
}

//Función Obtener Usuarios//
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'PACIENTE' });
        if (!users) return res.status(400).send({ message: 'No existen usuarios' })
        return res.send({ message: 'Usuarios: ', users });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo usuarios', err });
    }
}