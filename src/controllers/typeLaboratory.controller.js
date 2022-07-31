'use strict'

const TypeLaboratory = require('../models/typeLaboratory.model');
const Laboratory = require('../models/laboratory.model');
const { validateData } = require('../utils/validate');


//Función de Testeo//
exports.testTypeLaboratory = (req, res)=>
{
    return res.send({message: 'Función de Testeo -Tipos de Laboratorio- funcionando exitosamente.'}); 
}


//Agregar Tipo de Laboratorio//
exports.saveTypeLaboratory = async (req, res)=>
{
    try
    {
        const params = req.body; 
        const data = 
        {
            name: params.name,
            description: params.description,
        };

        const msg = validateData(data);

        if(msg)
        return res.status(400).send(msg);
                
        const existTypeLaboratory = await TypeLaboratory.findOne({name: params.name});
        if(existTypeLaboratory)
            return res.status(400).send({message: 'El Tipo de Laboratorio ya existe.'});
        
        const typeLaboratory = new TypeLaboratory(data);
        await typeLaboratory.save();
        return res.send({message: 'Tipo de Laboratorio creado exitosamente.', typeLaboratory});
    }
    catch(err)
    {
        console.log(err); 
        return res.status(500).send({message:'Error al crear el Tipo de Laboratorio.'}); 
    }
}


//Actualizar Tipo de Laboratorio//
exports.updateTypeLaboratory = async (req, res)=>
{
    try
    {
        const params = req.body;
        const typeLaboratory = req.params.id; 

        const typeLaboratoryExist =  await TypeLaboratory.findOne({_id: typeLaboratory});

        if(typeLaboratoryExist.name === 'DEFAULT')
            return res.status(400).send({message: 'El Tipo de Laboratorio -DEFAULT- no se puede Actualizar.'}); 
        
        const nameTypeLaboratory = await TypeLaboratory.findOne({name: params.name});
        
        if(nameTypeLaboratory && typeLaboratoryExist.name != params.name) 
            return res.status(400).send({message: 'El Tipo de Laboratorio ya Existe.'});
        const updateTypeLaboratory = await TypeLaboratory.findOneAndUpdate({_id: typeLaboratory}, params, {new: true});

        return res.send({message: 'Tipo de Laboratorio actualizado.', updateTypeLaboratory});
    }
    catch(err)
    {
        console.log(err);
        return err; 
    }
}


//Eliminar Tipo de Laboratorio//
exports.deleteTypeLaboratory = async (req, res)=>{
    try
    {

        const typeLaboratory = req.params.id;
        const typeLaboratoryExist = await TypeLaboratory.findOne({_id: typeLaboratory});
        if(!typeLaboratoryExist) return res.status(500).send({message: 'Tipo de Laboratorio no existe o ya esta eliminado.'});     

        if(typeLaboratoryExist.name === 'DEFAULT')
            return res.status(400).send({message: 'El Tipo de Laboratorio -DEFAULT- no se puede eliminar.'});

        const typeLaboratoryDefault = await TypeLaboratory.findOne({name:'DEFAULT'});
        
        if(!typeLaboratoryDefault)
        {
            const dataDefault = 
            {
                name: 'DEFAULT',
                description: 'Laboratorio Por DEFAULT'
            }
            var newTypeLaboratory = new TypeLaboratory(dataDefault);
            await newTypeLaboratory.save();
            await Laboratory.updateMany({typeLaboratory: typeLaboratory},{typeLaboratory: newTypeLaboratory._id});
        }
        else
        {
            await Laboratory.updateMany({typeLaboratory: typeLaboratory},{typeLaboratory: typeLaboratoryDefault._id});
        }

        const typeLaboratoryDeleted = await TypeLaboratory.findOneAndDelete({_id: typeLaboratory});
        return res.send({message: 'Tipo de Laboratorio elimnado exitosamente.', typeLaboratoryDeleted});
    }
    catch(err)
    {
        console.log(err); 
        return res.status(500).send({message:'Error al eliminar el Tipo de Laboratorio.'}); 
    }
}


//Mostrar todos los Tipos de Laboratorio//
exports.getTypesLaboratory = async (req, res)=>
{
    try
    {
        const typesLaboratory = await TypeLaboratory.find();
        return res.send({message: 'Tipos de Laboratorios encontrados:', typesLaboratory})
    }
    catch(err)
    {
        console.log(err); 
        return res.status(500).send({message:'Error al obtener los Tipos de Laboratorios.'}); 
    }
}


//Mostrar un Tipo de Laboratorio//
exports.getTypeLaboratory = async (req, res)=>{
    try
    {
        const typeLaboratory = req.params.id;
        const typeLaboratoryExist = await TypeLaboratory.findOne({_id: typeLaboratory});
        if (!typeLaboratoryExist) return res.status(400).send({message: 'Tipo de Laboratorio no encontrado.'})
        return res.send({message: 'Tipo de Laboratorio encontrado:', typeLaboratoryExist})
    }
    catch(err)
    {
        console.log(err); 
        return res.status(500).send({message:'Error al obtener el Tipo de Laboratorio.'});
    }
}

//Obtener Type Laboratory por el nombre
exports.getTypeLaboratoryByName = async (req, res)=>{
    try{
        const params = req.body;
        const data ={
            name: params.name
        }
        const typeLaboratory = await TypeLaboratory.find({name: {$regex: params.name, $options:'i'}});
        return res.send({message:'Tipos de Laboratorios encontrados: ', typeLaboratory});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error encontrando Tipos de Laboratorios.', err});
    }
}

// Obtener Type Laboratory ordenado de A a Z
exports.getTypeLaboratoryAtoZ = async (req, res) => {
    try {
        const TypeLaboratoryAtoZ = await TypeLaboratory.find();
        if (TypeLaboratoryAtoZ.length === 0) return res.send({ message: 'Tipos de Laboratorios no encontrados.' })
        TypeLaboratoryAtoZ.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (b.name > a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Tipos de Laboratorios encontrados:', TypeLaboratoryAtoZ })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener los Tipos de Laboratorios.' });
    }
}

// Obtener Type Laboratory ordenado de Z a A
exports.getTypeLaboratoryZtoA = async (req, res) => {
    try {
        const typeLaboratoryZtoA = await TypeLaboratory.find();
        if (typeLaboratoryZtoA.length === 0) return res.send({ message: 'Tipos de Laboratorios no encontrados.' })
        typeLaboratoryZtoA.sort((a, b) => {
            if (a.name > b.name) {
                return -1;
            } else if (b.name < a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Tipos de Laboratorios encontrados:', typeLaboratoryZtoA })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener los Tipos de Laboratorios.' });
    }
}