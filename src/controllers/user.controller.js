'use strict'

const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Prescription = require('../models/prescription.model');

const {validateData, encrypt, checkPassword, checkPermission} = require('../utils/validate');
const jwt = require('../services/jwt');

//Función de Testeo//
exports.userTest = async (req, res)=>
{
	return res.send({message: 'Función de testeo -USUARIO- funciona correctamente'});
}


//Función de Registro//
exports.register = async(req, res)=>
{
    try
    {
        const params = req.body;
        let data = 
        {
            name: params.name,
            surname: params.surname,
            username: params.username,
            DPI: params.DPI,
            email: params.email,
            phone: params.phone,
            password: params.password,
            gender: params.gender,
            role: 'PACIENTE'
        };

        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);

        if(params.NIT == '' || params.NIT == undefined || params.NIT == null)
        {
            data.NIT = 'C/F'
        }
        else
        {
            data.NIT = params.NIT
        }
        
        let alreadyUsername = await User.findOne({username: data.username});
        if(alreadyUsername) return res.status(400).send({message: 'El nombre de Usuario ya existe.'});

        let alreadyDPI = await User.findOne({DPI: data.DPI});
        if(alreadyDPI) return res.status(400).send({message: 'El DPI ya fué registrado.'});

        data.password = await encrypt(params.password);

        let user = new User(data);
        await user.save();
        let userView = await User.findOne({_id:user._id})
        return res.send({message: 'Usuario registrado Exitosamente.', userView});
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Registrar al Usuario.'});
    }
}


//Función Iniciar Sesión//
exports.login = async(req, res)=>
{
    try
    {
        const params = req.body;
        let data = 
        {
            username: params.username,
            password: params.password
        }
        let msg = validateData(data);

        if(msg) return res.status(400).send(msg);
        let already = await User.findOne({username: params.username});
        if(already && await checkPassword(data.password, already.password))
        {
            let token = await jwt.createToken(already);
            delete already.password;
            return res.send({message: 'Sesión Iniciada.', already, token});
        }else return res.status(401).send({message: 'Credenciales Incorrectas.'});
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Iniciar Sesión.'});
    }
}


//FUNCIONES DE USUARIO//

//Función Eliminar Cuenta//
exports.deleteAccount = async(req, res)=>
{
    try
    {
        const userID = req.params.id;

        //INGRESAR CONTRASEÑA PARA ELIMINAR//
        const params = req.body;

        const password = params.password;
        const data =
        {
            password: password
        }

        let msg = validateData(data);
            if(msg) return res.status(400).send(msg);

        const persmission = await checkPermission(userID, req.user.sub);
        if(persmission === false) return res.status(403).send({message: 'No posees los permisos para eliminar la Cuenta.'});

        const userExist = await User.findOne({_id:userID});

        if(userExist && await checkPassword(password, userExist.password))
        {
            const appointmentsExist = await Appointment.find({pacient: userID});
            for(let appointmentDeleted of appointmentsExist)
            {
                const appointmentDeleted = await Appointment.findOneAndDelete({pacient: userID});
            }

            const prescriptionsExist = await Prescription.find({pacient: userID});
            for(let prescriptionDeleted of prescriptionsExist)
            {
                const prescriptionDeleted = await Prescription.findOneAndDelete({pacient: userID});
            }

            const userDeleted = await User.findOneAndDelete({_id: userID})
            if(userDeleted) return res.send({message: 'Su cuenta ha sido Eliminada Exitosamente.', userDeleted});
            return res.send({message: 'Usuario no Encontrado o ya Elimnado.'});
        }

        return res.status(400).send({message:'La contraseña no es correcta.'})

    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Eliminar la Cuenta.'});
    }
}


//Función Actualizar Cuenta//
exports.updateAccount = async(req, res)=>
{
    try
    {
        const userID = req.params.id;
        const params = req.body;

        const permission = await checkPermission(userID, req.user.sub);
        if(permission === false) return res.status(401).send({message: 'No posees los permisos para actualizar la Cuenta.'});

        const userExist = await User.findOne({_id: userID});
        if(!userExist) return res.send({message: 'Usuario no Encontrado.'});

        let alreadyUsername = await User.findOne({username: params.username});
        if(alreadyUsername && userExist.username != params.username) 
            return res.status(400).send({message: 'El nombre de Usuario ya está en uso.'});
        
        const userUpdate = await User.findOneAndUpdate({_id: userID}, params, {new: true});
        if(userUpdate) 
            return res.send({message: 'Cuenta Actualizada Exitosamente.', userUpdate});
        return res.send({message: 'Cuenta no Actualizada.'});

    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Actualizar la Cuenta.'});
    }
}


//FUNCIONES DE ADMINISTRADOR//

//Función Agregar Usuario// 
exports.saveUser = async(req, res)=>
{
    try
    {
        const params = req.body;
        let data = 
        {
            name: params.name,
            surname: params.surname,
            username: params.username,
            DPI: params.DPI,
            email: params.email,
            phone: params.phone,
            password: params.password,
            gender: params.gender,
            role: 'PACIENTE'
        };

        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);

        if(params.NIT == '' || params.NIT == undefined || params.NIT == null)
        {
            data.NIT = 'C/F'
        }
        else
        {
            data.NIT = params.NIT
        }
        
        let alreadyUsername = await User.findOne({username: data.username});
        if(alreadyUsername) return res.status(400).send({message: 'El nombre de Usuario ya existe.'});

        let alreadyDPI = await User.findOne({DPI: data.DPI});
        if(alreadyDPI) return res.status(400).send({message: 'El DPI ya fué registrado.'});

        data.password = await encrypt(params.password);

        let user = new User(data);
        await user.save();
        let userView = await User.findOne({_id:user._id})
        return res.send({message: 'Usuario registrado Exitosamente.', userView});
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Registrar al Usuario.'});
    }
}


//Función Obtener Usuarios// 
exports.getUsers = async(req, res)=>
{
    try
    {
        const users = await User.find({role: 'PACIENTE'});
        return res.send({message:'Usuarios Encontrados:', users});
        
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Obtener los Usuarios.'});
    }
}


//Función Obtener Usuario// 
exports.getUser = async(req, res)=>
{
    try
    {
        const userID = req.params.id
        const user = await User.find({_id: userID});
        if(!user)
            return res.status(400).send({message: 'Usuario no Encontrado.'})
        return res.send({message:'Usuario Encontrado:', user});
        
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Obtener al Usuario.'});
    }
}


//Función Actualizar Usuario//
exports.updateUser = async(req, res)=>
{
    try
    {
        const userID = req.params.id;
        const params = req.body;

        const checkAdmin = await User.findOne({_id: userID});
            
        if(checkAdmin.role === 'ADMINISTRADOR') 
            return res.send({message: 'No se puede Actualizar al Administrador.'});

        if(params.password || params.role)
            return res.status(400).send({message: 'Algunos parámetros no se pueden actualizar'})

        const userExist = await User.findOne({_id: userID});
        if(!userExist) return res.send({message: 'Usuario no Encontrado.'});

        let alreadyUsername = await User.findOne({username: params.username});
        if(alreadyUsername && userExist.username != params.username) 
            return res.status(400).send({message: 'El nombre de Usuario ya está en uso.'});
        
        const userUpdate = await User.findOneAndUpdate({_id: userID}, params, {new: true});
        if(userUpdate) 
            return res.send({message: 'Usuario Actualizado Exitosamente.', userUpdate});
        return res.send({message: 'Usuario no Actualizado.'});
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Actualizar al Usuario.'});
    }
}

//Función Eliminar Usuario//
exports.deleteUser = async(req, res)=>
{
    try
    {
        const userID = req.params.id;

        const userExist = await User.findOne({_id:userID});

        if(userExist)
        {
            const checkAdmin = await User.findOne({_id: userID});

            if(checkAdmin.role == 'ADMINISTRADOR') 
                return res.send({message: 'No se puede Eliminar al Administrador.'});

            const appointmentsExist = await Appointment.find({pacient: userID});
            for(let appointmentDeleted of appointmentsExist)
            {
                const appointmentDeleted = await Appointment.findOneAndDelete({pacient: userID});
            }

            const prescriptionsExist = await Prescription.find({pacient: userID});
            for(let prescriptionDeleted of prescriptionsExist)
            {
                const prescriptionDeleted = await Prescription.findOneAndDelete({pacient: userID});
            }

            const userDeleted = await User.findOneAndDelete({_id: userID})
            if(userDeleted) return res.send({message: 'Usuario Eliminado Exitosamente', userDeleted});
            return res.send({message: 'Usuario no Encontrado o ya Eliminado.'});
        }
        return res.send({message: 'Usuario no Encontrado o ya Eliminado.'});

    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Eliminar la Cuenta.'});
    }
}