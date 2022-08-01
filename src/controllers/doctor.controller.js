'use strict'

const Doctor = require('../models/doctor.model');
const User = require('../models/user.model')
const Appointment = require('../models/appointment.model');
const Speciality = require('../models/speciality.model');

const { checkPassword, checkPermission, 
    checkUpdateDoctor, validateData, encrypt, 
    checkUpdateDoctorAdmin, validExtension } = require('../utils/validate');

////////////////////////////////// FUNCIONES DE DOCTOR PARA (ADMIN) /////////////////////////////////////////

//Connect Multiparty Upload Image//
const fs = require('fs');
const path = require('path');

//Función de Testeo//
exports.doctorTest = (req, res) => {
    return res.send({ message: 'Función de testeo -DOCTOR- funciona correctamente.' })
}

//Funcion de guardar Doctor por el ADMIN//
exports.saveDoctor = async (req, res) => {
    try {
        const params = req.body
        const data = {
            name: params.name,
            surname: params.surname,
            username: params.username,
            DPI: params.DPI,
            email: params.email,
            phone: params.phone,
            password: params.password,
            age: params.age,
            gender: params.gender,
            role: 'DOCTOR',
            collegiateNumber: params.collegiateNumber,
        }
        const msg = validateData(data);
        if (msg) return res.status(400).send(msg)

        const existDoctorEmail = await Doctor.findOne({ email: params.email });
        if (existDoctorEmail) return res.status(400).send({ message: 'El correo electrónico ya tiene una cuenta.' });

        const existDoctorUsername = await Doctor.findOne({ username: params.username });
        if (existDoctorUsername) return res.status(400).send({ message: 'El nombre de usuario ya tiene una cuenta.' });

        const existDoctorDPI = await Doctor.findOne({ DPI: params.DPI });
        if (existDoctorDPI) return res.status(400).send({ message: 'El número de DPI ya esta registrado.' });

        const existDoctorCollegiateNumber = await Doctor.findOne({ collegiateNumber: params.collegiateNumber });
        if (existDoctorCollegiateNumber) return res.status(400).send({ message: 'El número de colegiado ya esta registrado.' });
        
        if (params.speciality) {
            const specialityExist = await Speciality.findOne({ _id: params.speciality });
            if (!specialityExist) return res.status(400).send({ message: 'Especialidad no encontrada.' });
        }
        const correctionGender = params.gender.toUpperCase();
        if (correctionGender === 'MALE') {
            data.gender = 'MALE'
        } else if (correctionGender === 'FEMALE') {
            data.gender = 'FEMALE'
        } else {
            return res.status(400).send({ message: 'Género inválido.' })
        }
        
        data.password = await encrypt(params.password);
        data.speciality = params.speciality;

        let doctor = new Doctor(data);
        await doctor.save();

        let doctorExist = await Doctor.findOne({ _id: doctor._id });
        if (!doctorExist) {
            return res.status(400).send({ message: 'Error al guardar  el Doctor.' })
        }
        return res.send({ message: 'Doctor registrado exitosamente.', doctorExist });
    } catch (err) {
        console.log(err);
        return res.send({ message: 'Error guardando al Doctor.', err });
    }
}

//Funcion Actualizar Doctor por el ADMIN//
exports.updateDoctorByAdmin = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const params = req.body;

        const doctorExist = await Doctor.findOne({ _id: doctorId });
        if (!doctorExist) return res.status(400).send({ message: 'Doctor no encontrado.' });

        const emptyParams = await checkUpdateDoctorAdmin(params);
        if (emptyParams === false) return res.status(400).send({ message: 'No puedes actualizar con estos datos.' });

        const existDoctorEmail = await Doctor.findOne({ email: params.email });
        if (existDoctorEmail && doctorExist.email !== params.email) return res.status(400).send({ message: 'El correo electrónico ya tiene una cuenta' });

        const existDoctorUsername = await Doctor.findOne({ username: params.username });
        if (existDoctorUsername && doctorExist.username !== params.username) return res.status(400).send({ message: 'El nombre de usuario ya tiene una cuenta.' });

        const existDoctorDPI = await Doctor.findOne({ DPI: params.DPI });
        if (existDoctorDPI && doctorExist.DPI !== params.DPI) return res.status(400).send({ message: 'El número de DPI ya esta registrado.' });

        const existDoctorCollegiateNumber = await Doctor.findOne({ collegiateNumber: params.collegiateNumber });
        if (existDoctorCollegiateNumber && doctorExist.collegiateNumber !== params.collegiateNumber) return res.status(400).send({ message: 'El número de colegiado ya esta registrado.' });

        if (params.gender) {
            const correctionGender = params.gender.toUpperCase();
            if (correctionGender === 'MALE') {
                params.gender = 'MALE';
            } else if (correctionGender === 'FEMALE') {
                params.gender = 'FEMALE';
            } else {
                return res.status(400).send({ message: 'Género inválido.' });
            }
        }

        if (params.role) {
            if (params.role != 'DOCTOR') return res.status(400).send({ message: 'Rol inválido.' });
        }

        const doctorUpdate = await Doctor.findOneAndUpdate({ _id: doctorId }, params, { new: true });
        if (doctorUpdate) return res.send({ message: 'Doctor Actualizado Exitosamente.', doctorUpdate });
        return res.status(400).send({ message: 'Doctor no actualizado.' });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando al Doctor.', err });
    }
}

//Función Eliminar Doctor por el ADMIN//
exports.deleteDoctorByAdmin = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const params = req.body;
        const adminId = req.user.sub;

        const data = {
            password: params.password
        }

        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        const doctorExist = await Doctor.findOne({ _id: doctorId });
        if (!doctorExist) return res.status(400).send({ message: 'Doctor no encontrado o ya esta eliminado.' })

        const admin = await User.findOne({ _id: adminId });

        if (doctorExist && await checkPassword(data.password, admin.password)) {
            const appointmentsExist = await Appointment.find({ doctor: doctorId });
            if (appointmentsExist) {
                const appointmentDeleted = await Appointment.deleteMany({ doctor: doctorId })
            }
            const doctorDeleted = await Doctor.findOneAndDelete({ _id: doctorId })
            if (doctorDeleted) return res.send({ message: 'Su cuenta ha sido eliminada exitosamente.', doctorDeleted });
            return res.status(400).send({ message: 'Doctor no encontrado o ya esta eliminado.' });
        } else return res.status(400).send({ message: 'Contraseña incorrecta.' });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando al Doctor.', err })
    }
}

//Función Buscar Doctor por username por el ADMIN// 
exports.searchDoctor = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            username: params.username
        }
        const msg = validateData(data);
        if (!msg) {
            const doctores = await Doctor.find({ username: { $regex: params.username, $options: 'i' } }).populate('speciality');
            return res.send({ message: 'Doctores: ', doctores });
        } else return res.status(400).send(msg);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error buscando al Doctor.', err });
    }
}

//Función Obtener Doctores por el ADMIN//
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ role: 'DOCTOR' }).populate('speciality');
        if (!doctors) return res.status(400).send({ message: 'No existen doctores.' })
        return res.send({ message: 'Doctores: ', doctors });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo a los doctores.', err });
    }
}


////////////////////////////////// FUNCIONES DE DOCTOR PARA (DOCTORES) /////////////////////////////////////////

//Función Actualizar Doctor//
exports.updateDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const params = req.body;

        const permission = await checkPermission(doctorId, req.user.sub);
        if (permission === false) return res.status(401).send({ message: 'No posees los permisos para actualizar la cuenta.' });

        const doctorExist = await Doctor.findOne({ _id: doctorId });
        if (!doctorExist) return res.status(400).send({ message: 'Doctor no encontrado.' });

        const validateUpdateDoctor = await checkUpdateDoctor(params);
        if (validateUpdateDoctor === false) return res.status(400).send({ message: 'No puedes actualizar con estos datos.' });

        const existDoctorEmail = await Doctor.findOne({ email: params.email });
        if (existDoctorEmail && doctorExist.email !== params.email) return res.status(400).send({ message: 'El correo electrónico ya tiene una cuenta.' });

        const existDoctorUsername = await Doctor.findOne({ username: params.username });
        if (existDoctorUsername && doctorExist.username !== params.username) return res.status(400).send({ message: 'El nombre de usuario ya tiene una cuenta.' });

        const existDoctorDPI = await Doctor.findOne({ DPI: params.DPI });
        if (existDoctorDPI && doctorExist.DPI !== params.DPI) return res.status(400).send({ message: 'El número de DPI ya esta registrado.' });

        const existDoctorCollegiateNumber = await Doctor.findOne({ collegiateNumber: params.collegiateNumber });
        if (existDoctorCollegiateNumber && doctorExist.collegiateNumber !== params.collegiateNumber) return res.status(400).send({ message: 'El número de colegiado ya esta registrado.' });

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

        const doctorUpdate = await Doctor.findOneAndUpdate({ _id: doctorId }, params, { new: true });
        if (doctorUpdate)
            return res.send({ message: 'Doctor actualizado exitosamente.', doctorUpdate });
        return res.send({ message: 'Cuenta no actualizada.' });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: 'Error actualizando al Doctor.' })
    }
}

//Funcion eliminar Doctor
exports.deleteDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const params = req.body;
        const data = {
            password: params.password
        }

        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        const persmission = await checkPermission(doctorId, req.user.sub);
        if (persmission === false) return res.status(403).send({ message: 'No posees los permisos para eliminar la Cuenta.' });

        const doctorExist = await Doctor.findOne({ _id: doctorId });

        if (doctorExist && await checkPassword(data.password, doctorExist.password)) {
            const appointmentsExist = await Appointment.find({ doctor: doctorId });
            if (appointmentsExist) {
                const appointmentDeleted = await Appointment.deleteMany({ doctor: doctorId })
            }
            const doctorDeleted = await Doctor.findOneAndDelete({ _id: doctorId })
            if (doctorDeleted) return res.send({ message: 'Su cuenta ha sido eliminada exitosamente.', doctorDeleted });
            return res.send({ message: 'Doctor no encontrado o ya esta eliminado.' });
        }

        return res.status(400).send({ message: 'La contraseña es incorrecta.' });


    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando al Doctor.' })
    }
}

//Funcion obtener Doctor//
exports.getDoctor = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const doctor = await Doctor.findOne({ _id: doctorId }).populate('speciality');
        if (doctor) return res.send({ message: 'Doctor encontrado:', doctor });
        else res.status(400).send({ message: 'Doctor no encontrado.' })

    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: 'Error obteniendo al Doctor.', err })
    }
}

//Obtener Doctor por el nombre
exports.getDoctorByName = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name
        }
        const doctors = await Doctor.find({ name: { $regex: params.name, $options: 'i' } }).populate('speciality');
        return res.send({ message: 'Doctores encontrados: ', doctors });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error encontrando medicamento.', err });
    }
}

// Obtener Doctor ordenado de A a Z
exports.getDoctorAtoZ = async (req, res) => {
    try {
        const doctorAtoZ = await Doctor.find().populate('speciality');
        if (doctorAtoZ.length === 0) return res.send({ message: 'Doctores no encontrados.' })
        doctorAtoZ.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (b.name > a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Doctores encontrados:', doctorAtoZ })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener los Doctores.' });
    }
}

// Obtener doctor ordenado de Z a A
exports.getDoctorZtoA = async (req, res) => {
    try {
        const doctorZtoA = await Doctor.find().populate('speciality');
        if (doctorZtoA.length === 0) return res.send({ message: 'Doctores no encontrados.' })
        doctorZtoA.sort((a, b) => {
            if (a.name > b.name) {
                return -1;
            } else if (b.name < a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Doctores encontrados:', doctorZtoA })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener los Doctores.' });
    }
}

//IMPLEMENTACIÓN DE IMÁGENES//
exports.addImageDoctor = async(req,res)=>
{
    try
    {
        const doctorID = req.params.id;

        const permission = await checkPermission(doctorID, req.user.sub);
        if(permission === false) return res.status(401).send({message: 'No posees los permisos necesarios.'});
        const alreadyImage = await Doctor.findOne({_id: req.user.sub});
        let pathFile = './uploads/doctors/';
        if(alreadyImage.image) fs.unlinkSync(pathFile+alreadyImage.image);
        if(!req.files.image || !req.files.image.type) return res.status(400).send({message: 'No se pudo agregar la imagen.'});
        
        const filePath = req.files.image.path; 
       
        const fileSplit = filePath.split('\\'); 
        const fileName = fileSplit[2]; 

        const extension = fileName.split('\.'); 
        const fileExt = extension[1]; 

        const validExt = await validExtension(fileExt, filePath);
        if(validExt === false) return res.status(400).send('Tipo de Archivo no válido.');
        const updateUser = await Doctor.findOneAndUpdate({_id: req.user.sub}, {image: fileName}, {new: true}).lean();        
        if(!updateUser) return res.status(404).send({message: 'Doctor no existente.'});
        delete updateUser.password;
        return res.send(updateUser);
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al asignarle una imagen al Doctor.'});
    }
}

exports.getImageDoctor = async(req, res)=>
{
    try
    {
        const fileName = req.params.fileName;
        const pathFile = './uploads/doctors/' + fileName;

        const image = fs.existsSync(pathFile);
        if(!image) return res.status(404).send({message: 'Imagen no existente.'});
        return res.sendFile(path.resolve(pathFile));
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al obtener la Imagen del Doctor'});
    }
}