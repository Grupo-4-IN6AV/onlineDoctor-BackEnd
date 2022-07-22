'use strict'

const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');



const {validateData, encrypt, checkPassword, checkPermission} = require('../utils/validate');
const jwt = require('../services/jwt');

//Función de Testeo//
exports.appointmentTest = async (req, res)=>{
	return res.send({message: 'Función de testeo -Appointment- funciona correctamente'});
}


//Función para guardar un Appointment//
exports.saveAppointmentADMIN = async(req, res)=>{
    try{
        const params = req.body;
        const data = {
            pacient: params.pacient,
            doctor: params.doctor,
            date: params.date,
            modality: params.modality,
        };
        const msg = validateData(data);
        if(!msg){
            const user = await User.findOne({_id: params.pacient});
            if(!user) return res.send({message: 'Paciente no encontrado.'});
            const appoAlready = await Appointment.findOne({
                $and: [
                    {pacient: data.pacient},
                    {doctor: data.doctor}
                ]
            });
            if(appoAlready) return res.send({message: 'Appointment creada con este Doctor.'});
            const dateAlready = await Appointment.findOne({
                $and: [
                   {date: data.date},
                   {pacient: data.pacient} 
                ]
            });
            if(dateAlready) return res.send({message: 'Appointment creada en esta fecha.'});
            const appointment = new Appointment(data);
            await appointment.save();
            return res.send({message: 'Appointment Guardada Exitosamente.'});
        }else return res.status(400).send(msg);
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error al Guardar una cita.'});
    }
}