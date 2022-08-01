'use strict'

const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');



const { validateData, encrypt, deleteSensitiveData, checkPermission } = require('../utils/validate');
const jwt = require('../services/jwt');

//Función de Testeo//
exports.appointmentTest = async (req, res) => {
    return res.send({ message: 'Función de testeo -Appointment- funciona correctamente' });
}


//Función para guardar un Appointment//
exports.saveAppointmentADMIN = async (req, res) => {
    try {
        const params = req.body;

        const finishDateEntry = new Date(params.date);

        //VERIFICAR FECHAS VALIDAS//

        //Verificar con Fecha Actual//
        /*PARAMETRO DE ENTRADA DATA*/
        const dateLocalOne = new Date();
        const dateLocal = (dateLocalOne).toLocaleString('UTC', { timeZone: 'America/Guatemala' });
        const splitDate = dateLocal.split(' ');
        const splitDateOne = splitDate[0].split('/');
        if (splitDateOne[0] < 10) {
            splitDateOne[0] = '0' + splitDateOne[0];
        }
        if (splitDateOne[1] < 10) {
            splitDateOne[1] = '0' + splitDateOne[1];
        }
        const setDate = splitDateOne[2] + '-' + splitDateOne[1] + '-' + splitDateOne[0];
        const dateNow = new Date(setDate);


        const data = {
            pacient: params.pacient,
            doctor: params.doctor,
            date: finishDateEntry,
            modality: params.modality,
        };


        const msg = validateData(data);
        if (!msg) {
            const user = await User.findOne({ _id: params.pacient });
            if (!user) return res.send({ message: 'Paciente no encontrado.' });

            const doctor = await Doctor.findOne({ _id: params.doctor });
            if (!doctor) return res.send({ message: 'Doctor no encontrado.' });

            const appointmentMax = await Appointment.find({ $and: [{ doctor: params.doctor }, { date: finishDateEntry }] });
            if (appointmentMax.length > 20)
                return res.status(400).send({ message: 'No se puede agregar una cita porque se alcanzó el número máximo en el día, intente más tarde u otro día.' });

            const appoAlready = await Appointment.findOne({
                $and: [
                    { pacient: data.pacient },
                    { doctor: data.doctor }
                ]
            });

            if (appoAlready) return res.status(400).send({ message: 'Cita ya creada con este Doctor.' });

            const dateAlready = await Appointment.findOne({
                $and: [
                    { date: finishDateEntry },
                    { pacient: data.pacient }
                ]
            });

            if (dateAlready) return res.status(400).send({ message: 'Cita ya creada en esta fecha.' });

            const correctionModality = params.modality.toUpperCase();
            if (correctionModality === 'VIRTUAL') {
                params.modality = 'VIRTUAL';
            } else if (correctionModality === 'PRESENCIAL') {
                params.modality = 'PRESENCIAL';
            } else {
                return res.status(400).send({ message: 'Modalidad Inválida.' });
            }

            const appointment = new Appointment(data);
            await appointment.save();

            if (appointment) {
                const registerAppointmentUser = await User.findOneAndUpdate({ _id: user._id }, { $push: { appointment: { appointment: appointment._id, done: false } } }, { new: true });
                if (!registerAppointmentUser) return res.status(400).send({ message: 'Cita no creada.' });

                const registerAppointmentDoctor = await Doctor.findOneAndUpdate({ _id: doctor._id }, { $push: { appointment: { appointment: appointment._id, done: false } } }, { new: true });
                if (!registerAppointmentDoctor) return res.status(400).send({ message: 'Cita no creada.' });

            } else return res.status(400).send({ message: 'Cita no creada.' });

            return res.send({ message: 'Cita Guardada Exitosamente.', appointment });
        } else return res.status(400).send(msg);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Guardar una cita.' });
    }
}

exports.updateAppointmentADMIN = async (req, res) => {
    try {
        const params = req.body;
        const appoId = req.params.id;
        const finishDateEntry = new Date(params.date);


        const doctorExist = await Doctor.findOne({ _id: params.doctor });
        if (!doctorExist) return res.send({ message: 'Doctor no existe.' });

        //Valida si ya tiene una cita con el mismo doctor
        const apposUser = await Appointment.find({  pacient: params.pacient });

        for (let appo of apposUser) {
            if (appo.doctor == params.doctor) {
                if (appo._id != appoId) {
                    return res.status(400).send({ message: 'Cita ya creada con este Doctor.' })
                }
            }
        }

        const pacientExist = await User.findOne({ _id: params.pacient });
        if (!pacientExist) return res.send({ message: 'Paciente no existe.' });

        //Valida si ya tiene una cita con el mismo doctor
        const apposDoctor = await Appointment.find({ doctor: params.doctor });

        for (let appo of apposDoctor) {
            if (appo.pacient == params.pacient._id) {
                if (appo._id != appoId) {
                    return res.status(400).send({ message: 'Cita ya creada con este paciente.' })
                }
            }else{

            }
        }

        const dateAlready = await Appointment.findOne({
            $and: [
                { date: finishDateEntry },
                { pacient: params.pacient }
            ]
        });

        if (dateAlready) return res.status(400).send({ message: 'Cita ya creada en esta fecha.' });

        if (params.modality) {
            const correctionModality = params.modality.toUpperCase();
            if (correctionModality === 'VIRTUAL') {
                params.modality = 'VIRTUAL';
            } else if (correctionModality === 'PRESENCIAL') {
                params.modality = 'PRESENCIAL';
            } else {
                return res.status(400).send({ message: 'Modalidad Invalida.' });
            }
        }

        const updateAppointment = await Appointment.findOneAndUpdate({ _id: appoId }, params, { new: true })
            .populate('pacient doctor')
        if (updateAppointment) {

            const appointmenstsUpdate = await deleteSensitiveData(updateAppointment);
            return res.send({ appointmenstsUpdate, message: 'Cita actualizada.' });

        } else {

            return res.send({ message: 'Cita no encontrada.' });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al actualizar cita.' });
    }
}

exports.deleteAppointmentADMIN = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointmentExist = await Appointment.findOne({ _id: appointmentId });

        if (!appointmentExist) return res.status(400).send({ message: 'Cita no encontrada o eliminada actualmente.' });

        const appointmentDeleted = await Appointment.findOneAndDelete({ _id: appointmentId });
        if (!appointmentDeleted) return res.status(400).send({ message: 'Cita no eliminada. ' })

        const registerAppointmentUser = await User.findOneAndUpdate({ _id: appointmentExist.pacient }, { $pull: { 'appointment': { 'appointment': appointmentId } } }, { new: true });
        if (!registerAppointmentUser) return res.status(400).send({ message: 'Cita no eliminada.' });

        const registerAppointmentDoctor = await Doctor.findOneAndUpdate({ _id: appointmentExist.doctor }, { $pull: { 'appointment': { 'appointment': appointmentId } } }, { new: true });
        if (!registerAppointmentDoctor) return res.status(400).send({ message: 'Cita no eliminada.' });

        return res.send({ message: 'Cita eliminada exitosamente.', appointmentDeleted });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al eliminar cita.' });
    }
}

exports.getAppointmentsADMIN = async (req, res) => {
    try {
        let appointmentsExist = await Appointment.find()
            .populate('pacient doctor')

        if (appointmentsExist.length === 0) return res.send({ message: 'Citas no econtradas.' });

        appointmentsExist.map( async (apo)=> {
            await deleteSensitiveData(apo);
        })

        return res.send({message:'Citas Encotradas: ', appointmentsExist});

        
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener las citas.' });
    }
}

exports.getAppointmentADMIN = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.findOne({ _id: appointmentId })
            .populate('pacient doctor')

        if (!appointment) return res.send({ message: 'Cita no encontrada' });
        {
            await deleteSensitiveData(appointment);
            return res.send({message: 'Cita:' ,appointment});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener la cita.' });
    }
}

exports.getAppointmentsUser = async (req, res) => {
    try {
        const identity = req.user.sub;

        let appointmentsExist = await Appointment.find({doctor:identity})
            .populate('pacient doctor')

        if (appointmentsExist.length === 0) return res.status(400).send({ message: 'Citas no econtradas.' });

        appointmentsExist.map( async (apo) => {
            await deleteSensitiveData(apo);
        });

        return res.send({message:'Citas Encotradas: ', appointmentsExist});
        
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener las citas.' });
    }
}

exports.getAppointmentsPaciente = async (req, res) => {
    try {
        const identity = req.user.sub;
        
        let appointmentsExist = await Appointment.find({pacient:identity})
            .populate('pacient doctor')

        if (appointmentsExist.length === 0) return res.status(400).send({ message: 'Citas no econtradas.' });

        appointmentsExist.map( async (apo) => {
            await deleteSensitiveData(apo);
        })

        return res.send({message:'Citas Encotradas: ', appointmentsExist});
        
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener las citas.' });
    }
}