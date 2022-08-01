'use strict'

const Prescription = require('../models/prescription.model');
const PreviewPrescription = require('../models/previewPrescription.model');
const Medicament = require('../models/medicament.model');
const Laboratory = require('../models/laboratory.model');
const TypeLaboratory = require('../models/typeLaboratory.model');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');

const { validateData } = require('../utils/validate');
const { savePDF } = require('./prescriptionControllerPDF')

//Función de Testeo//
exports.previewPrescriptionTest = async (req, res) => {
    return res.send({ message: 'Función de testeo -Preview Prescription- funciona correctamente.' });
}

//Función para Guardar una Prescription//
exports.savePrescriptoionADMIN = async (req, res) => {
    try {
        const params = req.body;

        let data = 
        {
            date: new Date(),
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
            return res.status(400).send({ message: 'Receta no generada.'});
        }
        return res.send({ message: 'Receta generada exitosamente', previewPrescriptionNew });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al generar la Receta.' });
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
        const medicamentExistPrescription = await PreviewPrescription.findOne({ $and: [{ _id: prescriptionID }, { medicaments: params.medicaments }] });
        if (medicamentExistPrescription) return res.status(400).send({ message: 'Medicamento ya existe en la Receta.' });

        const prescriptionExist = await PreviewPrescription.findOne({ $and: [{ _id: prescriptionID }, { doctor: doctor}] });
        //Verificar que Exista la Prescrición. //
        if (!prescriptionExist)
            return res.status(400).send({ message: 'Receta no encontrada.' });
            
            const newPrescription = await PreviewPrescription.findOneAndUpdate({ _id: prescriptionExist._id },
            {
                $push: {medicaments: data.medicaments},
            },
            { new: true });
            
        return res.send({ message: 'Se agregó un nuevo medicamento a la Receta.', newPrescription })
    }catch(err){
        console.log(err);
        return res.status(400).send({message: 'Error agregando medicamento a la Receta. '})
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
        const laboratoryExistPrescription = await PreviewPrescription.findOne({ $and: [{ _id: prescriptionID }, { laboratorys: params.laboratorys }] });
        if (laboratoryExistPrescription) return res.status(400).send({ message: 'Laboratorio ya existe en la Receta.' });

        const prescriptionExist = await PreviewPrescription.findOne({ $and: [{ _id: prescriptionID }, { doctor: doctor}] });
        //Verificar que Exista la Prescrición. //
        if (!prescriptionExist)
            return res.status(400).send({ message: 'Receta no encontrada.' });

        const newPrescription = await PreviewPrescription.findOneAndUpdate({ _id: prescriptionExist._id },
            {
                $push:  {laboratorys: data.laboratorys} ,
            },
            { new: true });
            
        return res.send({ message: 'Se agregó un nuevo laboratorio a la Receta.', newPrescription })
    }catch(err){
        console.log(err);
        return res.status(400).send({message: 'Error agregando laboratorio a la Receta.'})
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

        const prescription = await PreviewPrescription.findOne({ _id: prescriptionID });
        if (!prescription) return res.status(400).send({ message: 'Receta no encontrada.' });


        const medicament = await Medicament.findOne({ _id: data.medicamentID });
        if (!medicament) return res.status(400).send({ message: 'Medicamento no existe.' });
        const medicamentsReservation = prescription.medicaments;

        for (let serv of medicamentsReservation) {
            if (serv == data.medicamentID) {
                //Eliminar el Medicamento//
                const deleteMedicamentPrescription = await PreviewPrescription.findOneAndUpdate(
                    { _id: prescriptionID },
                    { $pull: {medicaments: data.medicamentID} }, { new: true }).lean();
                //Eliminar el  Medicamento a la Prescripción //
                return res.send({ message: 'Medicamento eliminado satisfactoriamente ', deleteMedicamentPrescription });
            }
        }
        return res.status(400).send({ message: 'El Medicamento no se encontraba en la receta.' });
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

        const prescription = await PreviewPrescription.findOne({ _id: prescriptionID });
        if (!prescription) return res.status(400).send({ message: 'Receta no encontrada.' });


        const laboratory = await Laboratory.findOne({ _id: data.laboratoryID });
        if (!laboratory) return res.status(400).send({ message: 'Laboratorio no existe.' });
        const laboratorysReservation = prescription.laboratorys;

        for (let serv of laboratorysReservation) {
            if (serv == data.laboratoryID) {

                //Eliminar el Laboratorio//
                const deleteLaboratoryPrescription = await PreviewPrescription.findOneAndUpdate(
                    { _id: prescriptionID },
                    { $pull: { laboratorys: data.laboratoryID }  }, { new: true }).lean();
                //Eliminar el  Laboratorio a la Prescripción //
                return res.send({ message: 'Laboratorio eliminado satisfactoriamente.', deleteLaboratoryPrescription });

            }
        }
        return res.status(400).send({ message: 'El Laboratorio no se encontraba en la receta.' });
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

        const prescriptionExist = await PreviewPrescription.findOne({$and: [{_id: prescriptionID},{ doctor: req.user.sub}]});
            if(!prescriptionExist) return res.send({message: 'Receta no encontrada.'});

     
        const pacientExist = await User.findOne({_id: data.pacient});
            if(!pacientExist) return res.send({message: 'Paciente no encontrado.'});

        const prescriptionUpdate = await PreviewPrescription.findOneAndUpdate({_id: prescriptionID}, data, {new: true})
            .populate('pacient doctor medicaments laboratorys').lean();
        if(!prescriptionUpdate) return res.status(400).send({message: 'Receta no actualizada.'});
        return res.send({message: 'Receta actualizada', prescriptionUpdate});

        

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al actualizar la Receta.' });
    }

}

exports.deletePrescriptionADMIN = async (req, res) => {
    try {
        const prescriptionID = req.params.id;
        const userID = req.params.idUser;
        const prescriptionExist = await PreviewPrescription.findOne({ _id: prescriptionID });

        if (!prescriptionExist) return res.status(400).send({ message: 'Receta no encontrada o eliminada actualmente.' });

        const prescriptionDeleted = await PreviewPrescription.findOneAndDelete({ _id: prescriptionID });
        if (!prescriptionDeleted) return res.status(400).send({ message: 'Receta no eliminada.' })

        const registerPrescriptionUser = await User.findOneAndUpdate({ _id: userID }, { $pull: { 'prescription':  prescriptionID } }, { new: true });
        if (!registerPrescriptionUser) return res.status(400).send({ message: 'Receta no eliminada del usuario' });

        return res.send({ message: 'Receta eliminado exitosamente.', prescriptionDeleted });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al eliminar la Receta.' });
    }
}

exports.getPrescriptionsADMIN = async (req, res) => {
    try {
        const prescription = await PreviewPrescription.find().populate('doctor pacient medicaments laboratorys');
        if (prescription.length === 0) return res.status(400).send({ message: 'Recetas no encontradas.' });
        return res.send({ message: 'Recetas encontradas: ', prescription });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener las Recetas.' });
    }
}

exports.getPrescription = async (req, res) => {
    try {
        const prescriptionID = req.params.id;
        const prescription = await PreviewPrescription.findOne({ _id: prescriptionID }).populate('doctor pacient medicaments laboratorys');
        if (!prescription) return res.status(400).send({ message: 'Receta no encontrada.' });

        let laboratories = [];
        let medicaments = [];
        for(let type of prescription.laboratorys){
            const typeLaboratory = await Laboratory.findOne({_id: type._id }).populate('typeLaboratory');
            laboratories.push(typeLaboratory.typeLaboratory);
        }
        for(let medicament of prescription.medicaments){
            const medicamentsPush = await Medicament.findOne({_id: medicament._id }).populate('typeMedicament');
            medicaments.push(medicamentsPush);
        }
        return res.send({ message: 'Receta encontrada: ', prescription, laboratories, medicaments });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener la Receta.' });
    }
}

exports.getPrescriptionPDF = async (req, res) => {
    try 
    {
        const prescriptionID = req.params.id;
        const prescription = await PreviewPrescription.findOne({ _id: prescriptionID }).populate('doctor pacient medicaments laboratorys');
        const pdf = await savePDF(prescription);
        return res.send({message:'exito'})
    } 
    catch (err) 
    {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener Receta.' });
    }
}

exports.getPrescriptionsDOCTOR = async (req, res) => {
    try {
        const pacientID = req.params.id;
        const prescriptions = await PreviewPrescription.find({$and:[{pacient: pacientID},{doctor:req.user.sub}]}).populate('doctor pacient medicaments laboratorys');
        if (prescriptions.length === 0) return res.status(400).send({ message: 'Recetas no encontradas' });
        return res.send({ message: 'Recetas encontradas: ', prescriptions });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener las Recetas.' });
    }
}

exports.getPrescriptionsUSER = async (req, res) => {
    try {
        const prescriptions = await PreviewPrescription.find({pacient: req.user.sub}).populate('doctor pacient medicaments laboratorys');
        if (prescriptions.length === 0) return res.status(400).send({ message: 'Recetas no encontradas' });
        return res.send({ message: 'Recetas encontradas: ', prescriptions });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener Recetas.' });
    }
}
//Función para Obtener todos los Medicamentos//
exports.getMedicamentsOutPrescription = async (req, res) => {
    try {
        const prescriptionId = req.params.idPrescription;

        const medicaments = await Medicament.find().populate('typeMedicament');
        if(medicaments.length === 0) return res.status(400).send({message: 'No existen Medicamentos.'})

        const previewPrescription = await PreviewPrescription.findOne({_id: prescriptionId}).populate('medicaments');
        if(!previewPrescription) return res.send({message: 'No existe la vista previa de receta.'});

        const PrescriptionMedicaments = previewPrescription.medicaments;
        const medicamentsInPrescription = previewPrescription.medicaments;

        var medicamentsOutPrescription = medicaments;
        for (let medicamentInPrescription of PrescriptionMedicaments){
            for(let medicament of medicaments){
                if(medicament._id.valueOf() == medicamentInPrescription._id.valueOf()){
                    medicamentsOutPrescription.splice(medicaments.indexOf(medicament), 1)
                }
            }
        }
        return res.send({ message: 'Medicamentos encontrados:', medicamentsOutPrescription, medicamentsInPrescription})
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener los Medicamentos.' });
    }
};

//Función para Obtener todos los Medicamentos//
exports.getLaboratorysOutPrescription = async (req, res) => {
    try {
        const prescriptionId = req.params.idPrescription;

        const laboratorys = await Laboratory.find().populate('typeLaboratory');
        if(laboratorys.length === 0) return res.status(400).send({message: 'No existen Laboratorios.'})

        const previewPrescription = await PreviewPrescription.findOne({_id: prescriptionId}).populate('laboratorys');
        if(!previewPrescription) return res.send({message: 'No existe la vista previa de receta.'});

        const prescriptionLaboratorys = previewPrescription.laboratorys;
        const laboratorysInPrescription = previewPrescription.laboratorys;

        var laboratorysOutPrescription = laboratorys;
        for (let laboratoryInPrescription of prescriptionLaboratorys){
            for(let laboratory of laboratorys){
                if(laboratory._id.valueOf() == laboratoryInPrescription._id.valueOf()){
                    laboratorysOutPrescription.splice(laboratorys.indexOf(laboratory), 1)
                }
            }
        }
        return res.send({ message: 'Laboratorios encontrados:', laboratorysOutPrescription, laboratorysInPrescription})
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener los laboratorios.' });
    }
};