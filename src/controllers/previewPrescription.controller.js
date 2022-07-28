'use strict'

const Prescription = require('../models/prescription.model');
const PreviewPrescription = require('../models/previewPrescription.model');
const Medicament = require('../models/medicament.model');
const Laboratory = require('../models/laboratory.model');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');

const { validateData, checkPermission } = require('../utils/validate');
const jwt = require('../services/jwt');

//Función de Testeo//
exports.previewPrescriptionTest = async (req, res) => {
    return res.send({ message: 'Función de testeo -Preview Prescription- funciona correctamente.' });
}

//Función para Guardar una Prescription//
exports.savePrescriptoionADMIN = async (req, res) => {
    try {
        const params = req.body;

        let data = {
            pacient: params.pacient,
            doctor: params.doctor
        }

        const msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        const pacientExist = await User.findOne({ _id: params.pacient });
        if (!pacientExist) return res.send({ message: 'Paciente no encontrado o no existe.' });

        const doctorExist = await Doctor.findOne({ _id: params.doctor });
        if (!doctorExist) return res.send({ message: 'Doctor no encontrado o no existe.' });

        data.description = params.description;
        data.AnotherMedicaments = params.AnotherMedicaments;
        data.AnotherLaboratories = params.AnotherLaboratories;

        const previewPrescriptionNew = new PreviewPrescription(data);
        await previewPrescriptionNew.save();
        
        if(!previewPrescriptionNew){
            return res.status(400).send({ message: 'Receta No Generada'});
        }
        return res.send({ message: 'Receta Generada Exitosamente', previewPrescriptionNew });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Generar la Receta.' });
    }
}

exports.addMedicamento = async (req,res) => {
    try {
        
    }catch(err){
        console.log(err);
        return res.status(400).send({message: 'Error agregando medicamento a reseta '})
    }
}

exports.updatePrescriptionADMIN = async (req, res) => {
    try {
        const prescriptionID = req.params.id;
        const params = req.body;

        const msg = validateData(params);
        if (!msg) {
            console.log(params);
            const prescriptionExist = await Prescription.findOne({ _id: prescriptionID });
            if (!prescriptionExist) return res.send({ message: 'La receta no existe.' });

            const updatePrescription = await Prescription.findOneAndUpdate({ _id: prescriptionID }, params, { new: true });
            res.send({ message: 'Receta actualizada correctamente. ', updatePrescription })
        } else return res.status(400).send({ message: 'Parámetros vacíos.' })


    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Actualizar la Receta.' });
    }

}