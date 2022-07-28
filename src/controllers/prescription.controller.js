'use strict'

const Prescription = require('../models/prescription.model');
const Medicament = require('../models/medicament.model');
const Laboratory = require('../models/laboratory.model');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');

const { validateData , checkPermission } = require('../utils/validate');
const jwt = require('../services/jwt');

//Función de Testeo//
exports.prescriptionTest = async (req, res) => {
    return res.send({ message: 'Función de testeo -Prescription- funciona correctamente.' });
}

//Función para Guardar una Prescription//
exports.savePrescriptoionADMIN = async (req, res) => {
    try {
        const params = req.body;
        const userId = req.user.sub;
        let dataObligatoria = {
            pacient: params.pacient,
            doctor: params.doctor,
            medicament: params.medicament,
            laboratory: params.laboratory,
        }

        let msg = validateData(dataObligatoria);
        if (msg) return res.status(400).send(msg);

        const prescriptionExist = await Prescription.findOne({ user: userId });
        const pacientConPrescriptionExist = await User.findOne({ user: userId });

        const pacientExist = await User.findOne({ _id: params.pacient }).lean();
        if (!pacientExist) return res.send({ message: 'Paciente no encontrado o no existe.' });

        const medicamentExist = await Medicament.findOne({ _id: params.medicament }).lean();
        if (!medicamentExist) return res.send({ message: 'Medicamento no encontrado o no existe.' });

        const laboratoryExist = await Laboratory.findOne({ _id: params.laboratory }).lean();
        if (!laboratoryExist) return res.send({ message: 'Laboratorio no encontrado o no existe.' });

        const doctorExist = await Doctor.findOne({ _id: params.doctor }).lean();
        if (!doctorExist) return res.send({ message: 'Doctor no encontrado o no existe.' });


        if (!prescriptionExist) {
            const data = {
                pacient: params.pacient,
                doctor: params.doctor,
            }
            const medicament = {
                medicament: params.medicament,
            }
            const laboratory = {
                laboratory: params.laboratory,
            }
            const tiempoTranscurrido = Date.now();
            const hoy = new Date(tiempoTranscurrido);
            data.dateIssue = (hoy);
            data.medicaments = medicament;
            data.laboratorys = laboratory;

            const prescription = new Prescription(data);
            await prescription.save();
            console.log(pacientExist);
            return res.send({ message: 'Receta Generada Exitosamente', prescription });

        }else{
            //actualizar la receta//
            for(let medicament of prescriptionExist.medicaments){
                if(medicament.medicament !=params.medicament) continue;
                return res.send({message: 'Este medicamento ya esta en la receta.'});
            }
            for(let laboratory of prescriptionExist.laboratorys){
                if(laboratory.laboratory !=params.laboratory) continue;
                return res.send({message: 'Este Laboratorio ya esta en la receta.'});
            }

            const medicamentNew={
                medicament: params.medicament,
            }
            const laboratoryNew={
                laboratory: params.laboratory
            }

            const medicament = prescriptionExist.medicament + medicamentNew.medicament;
            const laboratory = prescriptionExist.laboratory + laboratoryNew.laboratory;
            const pushPrescription = await Prescription.findOneAndUpdate(
                {_id: prescriptionExist._id},
                {$push: {medicaments: medicamentNew},
                    medicament: medicament,
                },
                {new: true}
            )
            const pushPrescriptionDos = await Prescription.findOneAndUpdate(
                {_id: prescriptionExist._id},
                {$push: {laboratorys: laboratoryNew},
                laboratory: laboratory,
                },
                {new: true}
            )
            if(!pushPrescription || !pushPrescriptionDos) return res.send({message: 'Medicamento o Laboratorio no se añadio a la receta.'});
            return res.send({message: 'Nuevo Medicamento o Nuevo Laboratorio añadido exitosamente.', pushPrescription});

        }



    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Generar la Receta.' });
    }
}

exports.updatePrescriptionADMIN = async(req, res) =>{
    try{
        const prescriptionID = req.params.id;
        const params = req.body;

        const msg = validateData(params);
        if(!msg){
            console.log(params);
            const prescriptionExist = await Prescription.findOne({_id: prescriptionID});
            if(!prescriptionExist) return res.send({message: 'La receta no existe.'});

            const updatePrescription = await Prescription.findOneAndUpdate({_id: prescriptionID}, params, {new: true});
            res.send({message: 'Receta actualizada correctamente. ', updatePrescription})
        }else return res.status(400).send({ message: 'Parámetros vacíos.' })
        
        
    }catch(err){
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Actualizar la Receta.' });
    }

}