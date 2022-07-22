'use strict'

const Medicament = require('../models/medicament.model');
const TypeMedicament = require('../models/medicament.model');

const {validateData,checkPermission} = require('../utils/validate');
const jwt = require('../services/jwt');

//Función de Testeo//
exports.medicamentTest = async (req, res)=>{
	return res.send({message: 'Función de testeo -MEDICAMENT- funciona correctamente'});
}


//Funciones del Administrador//

//Función para Guardar un Medicamento//
exports.saveMedicamentADMIN = async (req, res)=>{
    try{
        const params = req.body;
        const data = {
            name: params.name,
            description: params.description,
            price: params.price,
            sales: 0,
            stock: params.stock,
            availibility: params.availibility,
            typeMedicament: req.user.sub,
        };
        const msg = validateData(data);
        if(!msg){
            let medicamentExist = await Medicament.findOne({ $and: [{name:params.name}, {typeMedicament: req.user.sub}]});
            if(!medicamentExist){
                if(data.price < 0)
                return res.status(400).send({message:'El precio no puede ser inferior a 0'})

                if(data.stock < 0)
                return res.status(400).send({message:'El stock no puede ser inferior a 0'})

                let saveMedicament = new Medicament(data);
                await saveMedicament.save();
                return res.send({message: 'Medicamento Guardado Exitosamente',saveMedicament});         
            }else return res.status(400).send({message: 'Este medicamento ya existe con este nombre.'});
        }else return res.status(400).send(msg);
    }
    catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error al Guardar un Medicamento.'});
    }
}


//Función para Actualizar un Medicamento//
exports.updateMedicamentADMIN = async(req, res)=>{
    try{
        const medicamentID = req.params.id;
        const params = req.body;

        
        const msg = validateData(params);
        if (!msg) {
            const medicamentExist = await Medicament.findOne({ _id: medicamentID });
            if (!medicamentExist) return res.status.send({ message: 'Medicamento no encontrada' });

            let alreadyName = await Medicament.findOne({ name: params.name });
            if (alreadyName && medicamentExist.name == params.name) return res.status(400).send({ message: 'Medicamento ya existe con este nombre' });

            const updateMedicament = await Medicament.findOneAndUpdate({ _id: medicamentID }, params, { new: true });
            return res.send({ message: 'Medicament Actulizado Correctamente', updateMedicament });

        } else return res.status(400).send({ message: 'Parámetros vacíos' })

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error al Actualizar un Medicamento.'});
    }
}


//Función para Eliminar un Medicamento//
exports.deleteMedicamentADMIN = async(req, res)=>{
    try{
        const medicamentID = req.params.id;
        const medicamentExist = await Medicament.findOne({ _id: medicamentID });
        if (!medicamentExist) return res.status(400).send({ message: 'Medicamento no encontrado o eliminado actualmente.' });

        const medicamentDeleted = await Medicament.findOneAndDelete({ _id: medicamentID });
        return res.send({ message: 'Medicamento Eliminado Exitosamente.', medicamentDeleted });

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error al Eliminar un Medicamento.'});
    }
}

//Función para Obtener todos los Medicamentos//
exports.getMedicamentsADMIN = async (req, res) => {
    try {
        const medicaments = await Medicament.find();
        if(!medicaments) return res.send({ message: 'Medicamentos no encontrados' })
        return res.send({ message: 'Medicamentos encontrados:', medicaments })
    } catch (err) {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Obtener los Medicamentos.'});
    }
}


//Mostrar un  Municipio//
exports.getMedicamentADMIN = async (req, res) => {
    try {
        const medicamentID = req.params.id
        const medicament = await Medicament.findOne({ _id: medicamentID });
        if(!medicament) return res.send({ message: 'Medicamento no encontrado' })
        return res.send({ message: 'Medicamento encontrado:', medicament })
    } catch (err) {
        console.log(err);
        return res.status(500).send({err, message: 'Error al Obtener el Medicamento.'});
    }
}


//Función para agregar una Imagen a un Medicamento//
exports.addImgMedicament = async(req,res)=>{
    try{
        const medicamentID = req.params.id;

        const permission = await checkPermission(medicamentID, req.user.sub);
        if(permission === false) return res.status(401).send({message: 'You dont have permission to update this user'});
        if(!req.files.image || !req.files.image.type) return res.status(400).send({message: 'Havent sent image'});
        
        const filePath = req.files.image.path; 
       
        const fileSplit = filePath.split('\\'); 
        const fileName = fileSplit[2]; 

        const extension = fileName.split('\.'); 
        const fileExt = extension[1]; 

        const validExt = await validExtension(fileExt, filePath);
        if(validExt === false) return res.status(400).send('Extensión invalida');
        const updateMedicament = await Medicament.findOneAndUpdate({_id: medicamentID}, {image: fileName});
        if(!updateMedicament) return res.status(404).send({message: 'Medicamento no encontrado'});
        return res.send(updateMedicament);
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error añadiendo una imagen al Medicamento.'});
    }
}