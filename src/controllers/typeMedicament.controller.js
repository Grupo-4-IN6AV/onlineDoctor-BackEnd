'use strict'

const TypeMedicament = require('../models/typeMedicament.model');
const Medicament = require('../models/medicament.model');
const {validateData,checkUpdate} = require('../utils/validate');
const jwt = require('../services/jwt');

//Función de Testeo//
exports.typeMedicamentTest = async (req, res)=>{
	return res.send({message: 'Función de testeo -Type Medicament- funciona correctamente'});
}


//Funciones para el Administrador//

//Función para Guardar un Type Medicament//
exports.saveTypeMedicamentADMIN = async (req, res)=>{
    try{
        const params = req.body; 
        const data = {
            name: params.name,
            description: params.description,
        };

        const msg = validateData(data);
        if(msg)
            return res.status(400).send(msg);
        
        const existTypeMedicament = await TypeMedicament.findOne({name: params.name});
        if(!existTypeMedicament){
            const typeMedicament = new TypeMedicament(data);
            await typeMedicament.save();
            return res.send({message: 'Type Medicament guardado exitosamente', typeMedicament});
        }else return res.status(400).send({message: 'Este Type Medicament ya existe'});
    
    }catch(err){
        console.log(err); 
        return err; 
    }

}

//Función para Actualizar un Type Medicament//
exports.updateTypeMedicamentADMIN = async(req, res)=>{
    try{
        const params = req.body;
        const typeMedicamentID = req.params.id;

        const check = await checkUpdate(params);
        if (check === false) return res.status(400).send({ message: 'Datos no recibidos' });

        const msg = validateData(params);
        if (!msg) {
            
            const existTypeMedicament =  await TypeMedicament.findOne({_id: typeMedicamentID});

            if(existTypeMedicament.name === 'DEFAULT')
            return res.status(400).send({message: 'El Tipo de Laboratorio -DEFAULT- no se puede Actualizar.'}); 
            
            const typeMedicamentExist = await TypeMedicament.findOne({ _id: typeMedicamentID });
            if (!typeMedicamentExist) return res.status.send({ message: 'Type Medicament no encontrada' });

            let alreadyName = await TypeMedicament.findOne({ name: params.name });
            if (alreadyName && typeMedicamentExist.name != params.name) return res.status(400).send({ message: 'Type Medicament ya existe con este nombre' });

            const updateTypeMedicament = await TypeMedicament.findOneAndUpdate({ _id: typeMedicamentID }, params, { new: true });
            return res.send({ message: 'Type Medicament Actulizado Correctamente', updateTypeMedicament });

        } else return res.status(400).send({ message: 'Parámetros vacíos' })
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error al Actualizar el Type Medicament.'});
    }

}

//Función para Eliminar una Type Medicament//
exports.deleteTypeMedicamentADMIN = async (req, res) => {
    try{
        const typeMedicamentID = req.params.id;
        const typeMedicamentExist = await TypeMedicament.findOne({ _id: typeMedicamentID });
        if (!typeMedicamentExist) return res.status(400).send({ message: 'Type Medicament no encontrado o eliminado actualmente.' });

        const existTypeMedicament = await TypeMedicament.findOne({_id: typeMedicamentID});
        if(existTypeMedicament.name === 'DEFAULT')
            return res.status(400).send({message: 'El Tipo de Laboratorio -DEFAULT- no se puede Eliminar.'});

        const typeMedicamentDefault = await TypeMedicament.findOne({name:'DEFAULT'});
        
        if(!typeMedicamentDefault)
        {
            const dataDefault = 
            {
                name: 'DEFAULT',
                description: 'Medicamento Por DEFAULT'
            }
            var newTypeMedicament = new TypeMedicament(dataDefault);
            await newTypeMedicament.save();
            await Medicament.updateMany({typeMedicament: typeMedicamentID},{typeMedicament: newTypeMedicament._id});
            
        }
        else
        {
            await Medicament.updateMany({typeMedicament: typeMedicamentID},{typeMedicament: typeMedicamentDefault._id});
        }

        const typeMedicamentDeleted = await TypeMedicament.findOneAndDelete({ _id: typeMedicamentID });
        return res.send({ message: 'Type Medicament eliminado exitosamente.', typeMedicamentDeleted });

    }catch (err){
        console.log(err);
        return res.status(500).send({err, message: 'Error al Eliminar el Type Medicament.'});
    }
}

//Función para Obtener los Type Medicaments//
exports.getTypeMedicamentsADMIN = async (req, res) =>{
    try{
        const typeMedicaments = await TypeMedicament.find();
        if(!typeMedicaments){
            res.send({message: 'No se encontraron Type Medicaments'})
        }else return res.send({ message: 'Type Medicaments:', typeMedicaments })
    }catch (err){
        console.log(err);
        return res.status(500).send({err, message: 'Error al Obtener los Type Medicaments.'});
    }
}


//Función para Obtener un Type Medicament//
exports.getTypeMedicamentADMIN = async (req, res) => {
    try {
        const typeMedicamentID = req.params.id;
        const typeMedicament = await TypeMedicament.findOne({ _id: typeMedicamentID });
        if(typeMedicament){
            return res.send({ message: 'Type Medicament encontrado:', typeMedicament })
        }else return res.send({ message: 'Type Medicament no encontrado.' })
    } catch (err) {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Obtener el Type Medicament.'});
    }
}