'use strict'

const Prescription = require('../models/prescription.model');
const PreviewPrescription = require('../models/previewPrescription.model');
const Medicament = require('../models/medicament.model');
const Laboratory = require('../models/laboratory.model');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');

const { validateData } = require('../utils/validate');

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



//Agregar Medicamento //
exports.addMedicamento = async (req,res) => {
    try {
        const prescriptionID = req.params.id;
        const params = req.body;
        const doctor = req.user.sub;
        const data = {
            medicaments: params.medicaments
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Medicamento//
        const medicamentExist = await Medicament.findOne({ _id: params.medicaments });
        if (!medicamentExist) return res.status(400).send({ message: 'Medicamento no encontrado.' });

        //Verificar que exista el Medicamento en la Prescripción.//
        const medicamentExistPrescription = await Prescription.findOne({ $and: [{ _id: prescriptionID }, { medicaments: params.medicaments }] });
        if (medicamentExistPrescription) return res.status(400).send({ message: 'Medicamento ya existe en la prescripción' });

        const prescriptionExist = await Prescription.findOne({ $and: [{ _id: prescriptionID }, { doctor: doctor}] });
        //Verificar que Exista la Prescrición. //
        if (!prescriptionExist)
            return res.status(400).send({ message: 'Prescripción no encontrada.' });


        const setMedicament = {
            medicaments: data.medicaments,
        }

        const newPrescription = await Prescription.findOneAndUpdate({ _id: prescriptionExist._id },
            {
                $push: { medicaments: setMedicament },
            },
            { new: true });
            
        return res.send({ message: 'Se Agregó un nuevo medicamento a la prescripción.', newPrescription })
    }catch(err){
        console.log(err);
        return res.status(400).send({message: 'Error agregando medicamento a la prescirpción. '})
    }
}





//Agregar Laboratorio //
exports.addLaboratory = async (req,res) => {
    try {
        const prescriptionID = req.params.id;
        const params = req.body;
        const doctor = req.user.sub;
        const data = {
            laboratorys: params.laboratorys
        };

        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        //Verificar que exista el Laboratorio//
        const laboratoryExist = await Laboratory.findOne({ _id: params.laboratorys });
        if (!laboratoryExist) return res.status(400).send({ message: 'Laboratorio no encontrado.' });

        //Verificar que exista el Laboratorio en la Prescripción.//
        const laboratoryExistPrescription = await Prescription.findOne({ $and: [{ _id: prescriptionID }, { laboratorys: params.laboratorys }] });
        if (laboratoryExistPrescription) return res.status(400).send({ message: 'Laboratorio ya existe en la prescripción.' });

        const prescriptionExist = await Prescription.findOne({ $and: [{ _id: prescriptionID }, { doctor: doctor}] });
        //Verificar que Exista la Prescrición. //
        if (!prescriptionExist)
            return res.status(400).send({ message: 'Prescripción no encontrada.' });


        const setLaboratory = {
            laboratorys: data.laboratorys,
        }

        const newPrescription = await Prescription.findOneAndUpdate({ _id: prescriptionExist._id },
            {
                $push: { laboratorys: setLaboratory },
            },
            { new: true });
            
        return res.send({ message: 'Se Agregó un nuevo laboratorio a la prescripción.', newPrescription })
    }catch(err){
        console.log(err);
        return res.status(400).send({message: 'Error agregando laboratorio a la prescripción '})
    }
}



//Eliminar Medicamento//
exports.deleteMedicament = async (req, res) => {
    try {
        const prescriptionID = req.params.id;
        const params = req.body;
        let data = {
            medicamentID: params.medicamentID
        };

        //Valida data obligatoria
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        const prescription = await Prescription.findOne({ _id: prescriptionID });
        if (!prescription) return res.status(400).send({ message: 'Prescripción no encontrada.' });


        const medicament = await Medicament.findOne({ _id: data.medicamentID });
        if (!medicament) return res.status(400).send({ message: 'Medicamento no existe.' });
        const medicamentsReservation = prescription.medicaments;

        for (let serv of medicamentsReservation) {
            if (serv.medicaments == data.medicamentID) {

                //Eliminar el Medicamento//
                const deleteMedicamentPrescription = await Prescription.findOneAndUpdate(
                    { _id: prescriptionID },
                    { $pull: { services: data.medicamentID }  }, { new: true }).lean();
                //Eliminar el  Medicamento a la Prescripción //
                return res.send({ message: 'Medicamento eliminado satisfactoriamente ', deleteMedicamentPrescription });

            }
            if(serv.medicaments != data.medicamentID) return res.send({message: 'Medicamento no existe o ya ha sido eliminado.'})
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminado medicamento.', err });
    }
}


//Eliminar Laboratorio//
exports.deleteLaboratory = async (req, res) => {
    try {
        const prescriptionID = req.params.id;
        const params = req.body;
        let data = {
            laboratoryID: params.laboratoryID
        };

        //Valida data obligatoria
        let msg = validateData(data);
        if (msg) return res.status(400).send(msg);

        const prescription = await Prescription.findOne({ _id: prescriptionID });
        if (!prescription) return res.status(400).send({ message: 'Prescripción no encontrada.' });


        const laboratory = await Laboratory.findOne({ _id: data.laboratoryID });
        if (!laboratory) return res.status(400).send({ message: 'Laboratorio no existe.' });
        const laboratorysReservation = prescription.laboratorys;

        for (let serv of laboratorysReservation) {
            if (serv.laboratorys == data.laboratoryID) {

                //Eliminar el Laboratorio//
                const deleteLaboratoryPrescription = await Prescription.findOneAndUpdate(
                    { _id: prescriptionID },
                    { $pull: { laboratorys: data.laboratoryID }  }, { new: true }).lean();
                //Eliminar el  Laboratorio a la Prescripción //
                return res.send({ message: 'Laboratorio eliminado satisfactoriamente ', deleteLaboratoryPrescription });

            }
            if(serv.medicaments != data.medicamentID) return res.send({message: 'Laoratorio no existe o ya ha sido eliminado.'})
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminado Laboratorio.', err });
    }
}





exports.updatePrescription = async (req, res) => {
    try {
        const prescriptionID = req.params.id;
        const params = req.body; 
        
        const data = {
            pacient: params.pacient,
            description: params.description,
            AnotherMedicaments: params.AnotherMedicaments,
            AnotherLaboratories: params.AnotherLaboratories,
        };

        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);

        const prescriptionExist = await Branch.findOne({$and: [{_id: prescriptionID},{ doctor: req.user.sub}]});
            if(!prescriptionExist) return res.send({message: 'Prescripción no encontrada'});

     
        const pacientExist = await User.findOne({_id: data.pacient});
            if(!pacientExist) return res.send({message: 'Paciente no encontrado'});

        const prescriptionUpdate = await Prescription.findOneAndUpdate({_id: prescriptionID}, data, {new: true}).lean();
        if(!prescriptionUpdate) return res.send({message: 'Prescripción no actualizada.'});
        return res.send({message: 'Prescripción actualizada', prescriptionUpdate});

        

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Actualizar la Prescripción.' });
    }

}