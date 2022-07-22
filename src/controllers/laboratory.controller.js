'use strict'

const Laboratory = require('../models/laboratory.model');
const TypeLaboratoy = require('../models/typeLaboratory.model');


const {validateData} = require('../utils/validate');
const jwt = require('../services/jwt');

//Función de Testeo//
exports.laboratoryTest = async (req, res)=>{
	return res.send({message: 'Función de testeo -LABORATORY- funciona correctamente.'});
}

exports.saveLaboratoryADMIN = async (req, res)=>{
    try{
        const params = req.body;
        let data ={
            typeLaboratoy: params.typeLaboratoy,
            date: params.date,
            specifications: params.specifications,
        }

        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);

        let laboratory = new Laboratory(data);
        await laboratory.save();
        let laboratoryView = await Laboratory.findOne({_id:laboratory._id})
        return res.send({message: 'Laboratirio registrado Exitosamente.', laboratoryView});

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error al Guardar Laboratorio.'});
    }
}