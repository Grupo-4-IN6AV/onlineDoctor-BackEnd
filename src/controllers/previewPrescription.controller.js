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

        if (!previewPrescriptionExist) {
            //Observa si los medicamentos existen
            var medicamentExistStatus = true;
            var laboratoryExistStatus = true;
            const data = {
                pacient: params.pacient,
                doctor: params.doctor,
            }
            if (!medicamentExistStatus) {
                res.status(400).send({ message: 'El medicamento no existe' });
            } else if (!laboratoryExistStatus) {
                res.status(400).send({ message: 'El laboratorio no existe' })
            }
            if (medicamentExistStatus) {
                const medicamentoData = {
                    name: null,
                    description: null,
                    medicament: null
                };
                if (params.name) {
                    medicamentoData.name = params.nameMedicament;
                    medicamentoData.description = params.descriptionMedicament;
                } else if (params.medicament) {
                    medicamentoData.medicament = params.medicament;
                }
                data.medicament = medicamentoData;
            }
            if (laboratoryExistStatus) {
                const laboratoryData = {
                    name: null,
                    description: null,
                    laboratory: null
                };
                if (params.nameLaboratory) {
                    laboratoryData.name = params.nameLaboratory;
                    laboratoryData.description = params.descriptionLaboratory;
                } else if (params.laboratory) {
                    laboratoryData.laboratory = params.laboratory;
                }
                data.laboratory = laboratoryData;
            }
            data.description = params.description
            const previewPrescription = new PreviewPrescription(data);
            await previewPrescription.save();
            return res.send({ message: 'Receta Generada Exitosamente', previewPrescription });

        } else {
            //Observa si los medicamentos existen
            var medicamentExistStatus = true;
            var laboratoryExistStatus = true;
            for (let medicament of previewPrescriptionExist.medicament) {
                if (medicament.name) {
                    if (medicament.name.toLowerCase() == params.nameMedicament.toLowerCase()) {
                        return res.status(400).send({ message: 'Este Medicamento ya esta en la receta.' });
                    }
                } else if (medicament.laboratory == params.laboratory) {
                    return res.status(400).send({ message: 'Este Medicamento ya esta en la receta.' });
                }
            }
            for (let laboratory of previewPrescriptionExist.laboratory) {
                if (laboratory.name) {
                    if (laboratory.name.toLowerCase() == params.nameLaboratory.toLowerCase()) {
                        return res.status(400).send({ message: 'Este Laboratorio ya esta en la receta.' });
                    }
                } else if (laboratory.laboratory == params.laboratory) {
                    return res.status(400).send({ message: 'Este Laboratorio ya esta en la receta.' });
                }
            }
            if (!medicamentExistStatus) {
                res.status(400).send({ message: 'El medicamento no existe' });
            } else if (!laboratoryExistStatus) {
                res.status(400).send({ message: 'El laboratorio no existe' })
            }

            const data = {}

            if (medicamentExistStatus) {
                const medicamentoData = {
                    name: null,
                    description: null,
                    medicament: null
                };
                if (params.name) {
                    medicamentoData.name = params.nameMedicament;
                    medicamentoData.description = params.descriptionMedicament;
                } else if (params.medicament) {
                    medicamentoData.medicament = params.medicament;
                }
                data.medicament = medicamentoData;
            }
            if (laboratoryExistStatus) {
                const laboratoryData = {
                    name: null,
                    description: null,
                    laboratory: null
                };
                if (params.nameLaboratory) {
                    laboratoryData.name = params.nameLaboratory;
                    laboratoryData.description = params.descriptionLaboratory;
                } else if (params.laboratory) {
                    laboratoryData.laboratory = params.laboratory;
                }
                data.laboratory = laboratoryData;
            }
            const pushPrescriptionMedicament = await PreviewPrescription.findOneAndUpdate(
                { _id: previewPrescriptionExist._id },
                { $push: data },
                { new: true }
            );

            if (!pushPrescriptionMedicament) return res.send({ message: 'Medicamento o Laboratorio no se añadio a la receta.' });
            return res.send({ message: 'Nuevo Medicamento o Nuevo Laboratorio añadido exitosamente.', pushPrescriptionMedicament });

        }



    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Generar la Receta.' });
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