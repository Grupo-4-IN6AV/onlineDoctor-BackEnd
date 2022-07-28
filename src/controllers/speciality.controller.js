'use strict'

const Speciality = require('../models/speciality.model');

const {validateData} = require('../utils/validate');

// Funcion  De Testeo //
exports.testSpeciality = (req,res)=>{
	return res.send({message: 'Función de testeo -ESPECIALIDAD- funciona correctamente'});
}

// Funcion Para Agregar Nueva Especialidad //
exports.saveSpeciality = async (req,res)=>{
	try{
		const params = req.body;
		const data = {
			name: params.name,
			description: params.description,
		};
		const msg = validateData(data);
		if(msg)
			return res.status(400).send(msg);
		const existSpeciality = await Speciality.findOne({ name: params.name });
		if (!existSpeciality){
			const speciality = new Speciality(data);
			await speciality.save();
			return res.send({ message: 'Especialidad creada satisfactoriamente.', speciality });
		}
		else return res.status(400).send({ message: 'La especialidad ya existe.'});

	}catch(err){
		console.log(err);
		return res.status(500).send({ message: 'Error creando la especialidad'});
    }
}

// Funcion Para Elimanda Nueva Specialidad //
exports. deleteSpeciality = async (req,res)=>{
	try{
		const specialityId = req.params.id;
		const deletedSpeciality = await Speciality.findOneAndDelete({ _id: specialityId});
		if(!deletedSpeciality){
			return res.status(500).send({ message: 'Especialidad no encontrada o ya eliminada.'});
		}
		else{
			return res.send({deletedSpeciality, message: 'Especialidad eliminada satisfactoriamente'});
		}

	}catch(err){
		console.log(err);
		return res.status(500).send({message: 'Error eliminando especialidad.'});
	}
}

// funcion para editar nueva especialidad //
exports.updateSpeciality = async (req,res) =>{
	try{
		const specialityId = req.params.id;
		const params = req.body;
		
		const specialityExist = await Speciality.findOne({_id: specialityId});
		if(!specialityExist) return res.status(400).send({message: 'Especialidad no encontrada'});

	const alreadyName = await Speciality.findOne({name: params.name});
	if(alreadyName && specialityExist.name != alreadyName.name)
		return res.send({message: 'El nombre de la especialidad ya en uso.'});
	const specialityEdited = await Speciality.findOneAndUpdate({_id: specialityId}, params, {new: true});
	if(!specialityEdited) return res.status(400).send({message: 'Especialidad no editada'})
	return res.send({message: 'Especialidad editada exitosamente'});
	}catch(err){
		console.log(err);
        	return res.status(500).send({ message: 'Error al editar la especialidad' });
	}
}


// Funcion Para Obtener Especialidad //
exports.getEspecialities = async (req, res)=>{
	try{
		const specialities = await Speciality.find();
		if(specialities.length == 0)
			return res.send({message: 'Aún no existen especialidades'});
		return res.send({message: 'Especialidades encontradas', specialities });
	}catch(err){
        console.log(err); 
        return res.status(500).send({ message: 'Error obteniendo las especialidades.' });
    }
}


// Funcion para obtener una especialidad //
exports.getEspeciality = async (req,res)=>{
	try{
		const especialityId = req.params.id;
		const speciality = await Speciality.findOne({_id: especialityId});
		if(!speciality)
			return res.status(400).send({message: 'Especialidad no encontrada'});
		return res.send({message: 'Especialidad encontrada', speciality});
	}catch(err){
		console.log(err); 
        	return res.status(500).send({ message: 'Error obteniendo la especialidad.' });
	}
}

//Obtener Speciality por el nombre
exports.getSpecialityByName = async (req, res)=>{
    try{
        const params = req.body;
        const data ={
            name: params.name
        }
        const doctors = await Speciality.find({name: {$regex: params.name, $options:'i'}});
        return res.send({message:'Speciality encontrada: ', doctors});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error encontrando Speciality.', err});
    }
}

// Obtener Speciality ordenado de A a Z
exports.getSpecialityAtoZ = async (req, res) => {
    try {
        const SpecialityAtoZ = await Speciality.find();
        if (SpecialityAtoZ.length === 0) return res.send({ message: 'Speciality no encontrados' })
        SpecialityAtoZ.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (b.name > a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Speciality encontrados:', SpecialityAtoZ })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener las Speciality.' });
    }
}

// Obtener Speciality ordenado de Z a A
exports.getSpecialityZtoA = async (req, res) => {
    try {
        const SpecialityZtoA = await Speciality.find();
        if (SpecialityZtoA.length === 0) return res.send({ message: 'Speciality no encontrados' })
        SpecialityZtoA.sort((a, b) => {
            if (a.name > b.name) {
                return -1;
            } else if (b.name < a.name) {
                return 1;
            } else {
                return 0;
            }
        })
        return res.send({ message: 'Speciality encontrados:', SpecialityZtoA })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener las Speciality.' });
    }
}