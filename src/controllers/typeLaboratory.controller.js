'use strict'

const TypeLaboratory = require('../models/typeLaboratory.model');
const Laboratory = require('../models/laboratory.model');
const { validateData } = require('../utils/validate');


//Función de Testeo//
exports.testTypeLaboratory = (req, res)=>
{
    return res.send({message: 'Función de Testeo -TIPOS DE LABORATORIO- funcionando exitosamente.'}); 
}


//Agregar Tipo de Laboratorio//
exports.saveTypeLaboratory = async (req, res)=>
{
    try
    {
        const params = req.body; 
        const data = 
        {
            name: params.nombre,
            description: params.descripcion,
        };

        const msg = validateData(data);

        if(msg)
        return res.status(400).send(msg);
                
        const existTypeLaboratory = await TypeLaboratory.findOne({name: params.nombre});
        if(existTypeLaboratory)
            return res.status(400).send({message: 'El Tipo de Laboratorio ya existe.'});
        
        const typeLaboratory = new TypeLaboratory(data);
        await typeLaboratory.save();
        return res.send({message: 'Tipo de Laboratorio creado Exitosamente.', typeLaboratory});
    }
    catch(err)
    {
        console.log(err); 
        return res.status(500).send({message:'Error al crear el Tipo de Laboratorio.'}); 
    }
}


//Eliminar Tipo de Laboratorio//
exports.deleteTypeLaboratory = async (req, res)=>{
    try
    {

        const typeLaboratory = req.params.id;
        const typeLaboratoryExist = await TypeLaboratory.findOne({_id: typeLaboratory});
        if(!typeLaboratoryExist) return res.status(500).send({message: 'Tipo de Laboratorio no Existente o ya Eliminado.'});     

        if(typeLaboratoryExist.name === 'DEFAULT')
            return res.status(400).send({message: 'El Tipo de Laboratorio -DEFAULT- no se puede Eliminar.'});

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
        }

        const laboratoryExist = await Laboratory.find({typeLaboratory: typeLaboratory}); 


        for(let laboratory of laboratoryExist)
        {
            const newLaboratory = await Laboratory.findOneAndUpdate({_id:laboratory._id},{typeLaboratory:newTypeLaboratory._id},{new:true});
        } 

        const typeLaboratoryDeleted = await TypeLaboratory.findOneAndDelete({_id: typeLaboratory});
        return res.send({message: 'Tipo de Laboratorio Elimnado Exitosamente.', typeLaboratoryDeleted});
    }
    catch(err)
    {
        console.log(err); 
        return res.status(500).send({message:'Error al Eliminar el Tipo de Laboratorio.'}); 
    }
}


//Mostrar todos los Tipos de Laboratorio//
exports.getTypesLaboratory = async (req, res)=>
{
    try
    {
        const typesLaboratory = await TypeLaboratory.find();
        return res.send({message: 'Tipos de Laboratorio Encontrados:', typesLaboratory})
    }
    catch(err)
    {
        console.log(err); 
        return res.status(500).send({message:'Error al obtener los Tipos de Laboratorio.'}); 
    }
}


//Mostrar un Tipo de Laboratorio//
exports.getTypeLaboratory = async (req, res)=>{
    try
    {
        const typeLaboratory = req.params.id;
        const typeLaboratoryExist = await TypeLaboratory.findOne({_id: typeLaboratory});
        if (!typeLaboratoryExist) return res.status(400).send({message: 'Tipo de Laboratorio Encontrado.'})
        return res.send({message: 'Tipo de Laboratorio Encontrado:', typeLaboratoryExist})
    }
    catch(err)
    {
        console.log(err); 
        return res.status(500).send({message:'Error al obtener el Tipo de Laboratorio.'});
    }
}
