'use strict'

const Laboratory = require('../models/laboratory.model');
const TypeLaboratory = require('../models/typeLaboratory.model');
const User = require('../models/user.model');


const { validateData } = require('../utils/validate');
const jwt = require('../services/jwt');

//Función de Testeo//
exports.laboratoryTest = async (req, res) => {
    return res.send({ message: 'Función de testeo -LABORATORY- funciona correctamente.' });
}

exports.saveLaboratoryADMIN = async (req, res) => {
    try {
        const params = req.body;
        const finishDateEntry = new Date(params.date);

        let data = {
            typeLaboratory: params.typeLaboratory,
            date: params.date,
            specifications: params.specifications,
            pacient: params.pacient,
        }

        let msg = validateData(data);
        if (!msg) {

            const typeLaboratoryExist = await TypeLaboratory.findOne({ _id: data.typeLaboratory });
            if (!typeLaboratoryExist) return res.status(400).send({ message: 'Tipo de Laboratorio no encontrado' });

            const pacientExist = await User.findOne({ _id: params.pacient });
            if (!pacientExist) return res.send({ message: 'Paciente no existe' });

            const dateAlready = await Laboratory.findOne({
                $and: [
                    { date: finishDateEntry },
                    { pacient: data.pacient }
                ]
            });

            if (dateAlready) return res.status(400).send({ message: 'Laboratorio ya creado en esta fecha.' });

            let laboratory = new Laboratory(data);
            await laboratory.save();

            if (laboratory) {

                const registerLaboratoryUser = await User.findOneAndUpdate({ _id: pacientExist._id }, { $push: { laboratory: { laboratory: laboratory._id, done: false, description: data.specifications } } }, { new: true });
                if (!registerLaboratoryUser) return res.status(400).send({ message: 'Laboratorio no creado' });

            } else return res.status(400).send({ message: 'Laboratorio no creado' });

            return res.send({ message: 'Laboratorio registrado Exitosamente.', laboratory });

        } else return res.status(400).send(msg);

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Guardar Laboratorio.' });
    }
}

exports.updateLaboratoryADMIN = async (req, res) => {
    try {
        const params = req.body;
        const laboratoryID = req.params.id;
        const finishDateEntry = new Date(params.date);

        const msg = validateData(params);

        if (!msg) {

            const typeLaboratoryExist = await TypeLaboratory.findOne({ _id: params.typeLaboratory });
            if (!typeLaboratoryExist) return res.status(400).send({ message: 'Tipo de Laboratorio no encontrado' });

            const pacientExist = await User.findOne({ _id: params.pacient });
            if (!pacientExist) return res.send({ message: 'Paciente no existe' });

            const dateAlready = await Laboratory.findOne({
                $and: [
                    { date: finishDateEntry },
                    { pacient: params.pacient }
                ]
            });

            if (dateAlready) return res.status(400).send({ message: 'Laboratorio ya creado en esta fecha.' });

            const updateLaboratory = await Laboratory.findOneAndUpdate({ _id: laboratoryID }, params, { new: true }).populate('typeLaboratory pacient')
            if (!updateLaboratory) return res.status(400).send({ message: 'Laboratorio no encontrado' });

            const updateUser = await User.findOneAndUpdate(
                { $and: [{ _id: params.pacient }, { "laboratory.laboratory": laboratoryID }] },
                { "laboratory.$.description": (params.specifications), "laboratory.$.done": (params.done) },
                { new: true });

            return res.send({ message: 'Laboratorio actualizado Correctamente', updateLaboratory });

        } else return res.status(400).send({ message: 'Parámetros vacíos' })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al actualizar Laboratorio.' });
    }
}

exports.deleteLaboratoryADMIN = async (req, res) => {
    try {
        const params = req.body;
        const laboratoryID = req.params.id;
        const laboratoryExist = await Laboratory.findOne({ _id: laboratoryID });

        if (!laboratoryExist) return res.status(400).send({ message: 'Laboratorio no encontrado o eliminado actualmente.' });

        const laboratoryDeleted = await Laboratory.findOneAndDelete({ _id: laboratoryID });
        if (!laboratoryDeleted) return res.status(400).send({ message: 'Laboratorio no eliminado. ' })

        const registerLaboratoryUser = await User.findOneAndUpdate({ _id: params.pacient }, { $pull: { 'laboratory': { 'laboratory': laboratoryID } } }, { new: true });
        if (!registerLaboratoryUser) return res.status(400).send({ message: 'Laboratorio no eliminado del usuario' });

        return res.send({ message: 'Laboratorio eliminado exitosamente.', laboratoryDeleted });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al eliminar Laboratorio.' });
    }
}

exports.getLaboratoriesADMIN = async (req, res) => {
    try {
        const laboratories = await Laboratory.find().populate('typeLaboratory pacient')
        if (!laboratories) return res.status(400).send({ message: 'Laboratorios no encontrados' });
        return res.send({ message: 'Laboratorios encontrados: ', laboratories });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener Laboratorios.' });
    }
}

exports.getLaboratoryADMIN = async (req, res) => {
    try {
        const laboratoryID = req.params.id;
        const laboratory = await Laboratory.findOne({ _id: laboratoryID }).populate('typeLaboratory pacient')
        if (!laboratory) return res.status(400).send({ message: 'Laboratorio no encontrados' });
        return res.send({ message: 'Laboratorio encontrado: ', laboratory });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener Laboratorio.' });
    }
}