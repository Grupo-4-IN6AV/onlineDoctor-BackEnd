'use strict'

const Medicament = require('../models/medicament.model');
const TypeMedicament = require('../models/medicament.model');

const { validateData, checkPermission, validExtension } = require('../utils/validate');
const jwt = require('../services/jwt');

//Connect Multiparty Upload Image//
const fs = require('fs');
const path = require('path');

//Función de Testeo//
exports.medicamentTest = async (req, res) => {
    return res.send({ message: 'Función de testeo -MEDICAMENT- funciona correctamente.' });
}


//Funciones del Administrador//

//Función para Guardar un Medicamento//
exports.saveMedicamentADMIN = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name,
            description: params.description,
            typeMedicament: params.typeMedicament,
            price: params.price,
            stock: params.stock,
            sales: 0,
        };
        const msg = validateData(data);
        if (!msg) {
            let medicamentExist = await Medicament.find({ name: params.name });
            if (medicamentExist.length === 0) {
                if (data.price < 0)
                    return res.status(400).send({ message: 'El precio no puede ser inferior a 0.' })

                if (data.stock < 0)
                    return res.status(400).send({ message: 'El stock no puede ser inferior a 0.' })

                if (data.stock > 0)
                    data.availibility = true;
                else
                    data.availibility = false;

                let saveMedicament = new Medicament(data);
                await saveMedicament.save();
                if (!saveMedicament) return res.status(400).send({ message: 'Medicamento no guardado.' });
                return res.send({ message: 'Medicamento guardado exitosamente.', saveMedicament });
            } else return res.status(400).send({ message: 'Este medicamento ya existe con este nombre.' });
        } else return res.status(400).send(msg);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al guardar un Medicamento.' });
    }
}


//Función para Actualizar un Medicamento//
exports.updateMedicamentADMIN = async (req, res) => {
    try {
        const medicamentID = req.params.id;
        const params = req.body;


        const msg = validateData(params);
        if (!msg) {
            const medicamentExist = await Medicament.findOne({ _id: medicamentID });

            if (!medicamentExist) return res.status.send({ message: 'Medicamento no encontrado.' });

            let alreadyName = await Medicament.findOne({ name: params.name });
            if (alreadyName && medicamentExist.name !== params.name) return res.status(400).send({ message: 'Medicamento ya existe con este nombre.' });

            if (params.price < 0)
                return res.status(400).send({ message: 'El precio no puede ser inferior a 0.' })

            if (params.stock < 0)
                return res.status(400).send({ message: 'El stock no puede ser inferior a 0.' })

            if (params.stock > 0)
                params.availibility = true;
            else
                params.availibility = false;

            const updateMedicament = await Medicament.findOneAndUpdate({ _id: medicamentID }, params, { new: true });
            if (!updateMedicament) {
                return res.status(400).send({ message: 'Medicamento no actualizado.' });
            }
            return res.send({ message: 'Medicamento Actualizado Correctamente', updateMedicament });

        } else return res.status(400).send({ message: 'Parámetros vacíos.' })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al actualizar un Medicamento.' });
    }
}


//Función para Eliminar un Medicamento//
exports.deleteMedicamentADMIN = async (req, res) => {
    try {
        const medicamentID = req.params.id;
        const medicamentExist = await Medicament.findOne({ _id: medicamentID });
        if (!medicamentExist) return res.status(400).send({ message: 'Medicamento no encontrado o eliminado actualmente.' });

        const medicamentDeleted = await Medicament.findOneAndDelete({ _id: medicamentID });
        return res.send({ message: 'Medicamento eliminado exitosamente.', medicamentDeleted });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al eliminar un Medicamento.' });
    }
}

//Función para Obtener todos los Medicamentos//
exports.getMedicaments = async (req, res) => {
    try {
        const medicaments = await Medicament.find().populate('typeMedicament');
        if (!medicaments) return res.send({ message: 'Medicamentos no encontrados.' })
        return res.send({ message: 'Medicamentos encontrados:', medicaments })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener los Medicamentos.' });
    }
}


// Obtener medicamento ordenado de A a Z
exports.getMedicamentsAtoZ = async (req, res) => {
    try {
        const medicamentsAtoZ = await Medicament.find().populate('typeMedicament');
        if (medicamentsAtoZ.length === 0) return res.send({ message: 'Medicamentos no encontrados.' })
        medicamentsAtoZ.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (b.name > a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Medicamentos encontrados:', medicamentsAtoZ })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener los Medicamentos.' });
    }
}

// Obtener medicamento ordenado de Z a A
exports.getMedicamentsZtoA = async (req, res) => {
    try {
        const medicamentsZtoA = await Medicament.find().populate('typeMedicament');
        if (medicamentsZtoA.length === 0) return res.send({ message: 'Medicamentos no encontrados.' })
        medicamentsZtoA.sort((a, b) => {
            if (a.name > b.name) {
                return -1;
            } else if (b.name < a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Medicamentos encontrados:', medicamentsZtoA })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener los Medicamentos.' });
    }
}

//Función para Obtener todos los Medicamentos por el ID de type Medicament//
exports.getMedicamentsByTypeMedicament = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            typeMedicament: params.typeMedicament //Recibe el ID de type Medicament
        }
        const msg = validateData(data)
        if (msg) return res.status(400).send(msg)
        const getMedicamentsByTypeMedicament = await Medicament.find({ typeMedicament: params.typeMedicament }).populate('typeMedicament');
        if (getMedicamentsByTypeMedicament.length === 0) return res.send({ message: 'Medicamentos no encontrados.' })
        return res.send({ message: 'Medicamentos encontrados:', getMedicamentsByTypeMedicament })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener los Medicamentos.' });
    }
}


//Mostrar un  Meicament//
exports.getMedicamentADMIN = async (req, res) => {
    try {
        const medicamentID = req.params.id
        const medicament = await Medicament.findOne({ _id: medicamentID }).populate('typeMedicament');
        if (!medicament) return res.send({ message: 'Medicamento no encontrado.' })
        return res.send({ message: 'Medicamento encontrado:', medicament })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener el Medicamento.' });
    }
}

//Obtener medicamento por el nombre
exports.getMedicamentsByName = async (req, res)=>{
    try{
        const params = req.body;
        const data ={
            name: params.name
        }

        const medicaments = await Medicament.find({name: {$regex: params.name, $options:'i'}});
        return res.send({message:'Medicamentos encontrados.', medicaments});

    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error encontrando Medicamentos.', err});
    }
}


//IMPLEMENTACIÓN DE IMÁGENES//
exports.addImageMedicament = async(req,res)=>
{
    try
    {
        const medicamentID = req.params.id;
        const alreadyImage = await Medicament.findOne({_id: medicamentID});
        let pathFile = './uploads/medicaments/';
        if(alreadyImage.image) fs.unlinkSync(pathFile+alreadyImage.image);
        if(!req.files.image || !req.files.image.type) return res.status(400).send({message: 'No se pudo agregar la imagen.'});
        
        const filePath = req.files.image.path; 
       
        const fileSplit = filePath.split('\\'); 
        const fileName = fileSplit[2]; 

        const extension = fileName.split('\.'); 
        const fileExt = extension[1]; 

        const validExt = await validExtension(fileExt, filePath);
        if(validExt === false) return res.status(400).send('Tipo de archivo no válido.');
        const updateMedicament = await Medicament.findOneAndUpdate({_id: medicamentID}, {image: fileName}, {new: true}).lean();
        if(!updateMedicament) return res.status(404).send({message: 'Medicamento no existente.'})
        return res.send(updateMedicament);
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al asignarle una imagen al Medicamento.'});
    }
}

exports.getImageMedicament = async(req, res)=>
{
    try
    {
        const fileName = req.params.fileName;
        const pathFile = './uploads/medicaments/' + fileName;

        const image = fs.existsSync(pathFile);
        if(!image) return res.status(404).send({message: 'Imagen no existente.'});
        return res.sendFile(path.resolve(pathFile));
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error al obtener la imagen del Medicamento.'});
    }
}