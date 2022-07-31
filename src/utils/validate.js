'use strict'

const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user.model');

//Importación del Modelo -ShoppingCart- //
const ShoppingCart = require('../models/shoppingCart.model');


exports.validateData = (data) => {
    let keys = Object.keys(data), msg = '';

    for (let key of keys) {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '' && data[key] !== "null" && data[key] !== "undefined") continue;
        msg += `El parámetro ${key} es requerido.\n`
    }
    return msg.trim();
}

exports.encrypt = async (password) => 
{
    try {
        return bcrypt.hashSync(password);
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkPassword = async (password, hash) => 
{
    try 
    {
        return bcrypt.compareSync(password, hash);
    } 
    catch (err) 
    {
        console.log(err);
        return err;
    }
}

exports.checkUpdateAdmin = async (user)=>{
    if(user.password || Object.entries(user).length === 0){
        return false;
    }else{
        return true;
    }
}

exports.checkUpdate = async (user)=>{
    if(user.password || Object.entries(user).length === 0 || user.role){
        return false;
    }else{
        return true;
    }
}

exports.checkUpdateDoctor = async (doctor)=>{
    if(doctor.password || Object.entries(doctor).length === 0 || doctor.role){
        return false;
    }else{
        return true;
    }
}

exports.checkUpdateDoctorAdmin = async (doctor)=>{
    if(doctor.password || Object.entries(doctor).length === 0){
        return false;
    }else{
        return true;
    }
}

exports.checkPermission = async (userId, sub) => 
{
    try 
    {
        if (userId != sub) 
        {
            return false;
        } 
        else 
        {
            return true;
        }
    } 
    catch (err) 
    {
        console.log(err);
        return err;
    }
}

exports.deleteSensitiveData = async(data)=>{
    try{
        data.pacient.password = undefined;
        data.pacient.role = undefined;
        data.doctor.password = undefined;
        data.doctor.role = undefined;
        return data;
        
    }catch(err){
        console.log(err);
        return err;
    }
}

//Eliminación de Datos Innecesarios Carrito de Compras//
exports.detailsShoppingCart = async(shoppingCartId)=>
{   
    const searchShoppingCart = await ShoppingCart.findOne({_id:shoppingCartId})
    .populate('user')
    .lean();

    for(var key = 0; key < searchShoppingCart.products.length; key++)
    {
        delete searchShoppingCart.user.password;
        delete searchShoppingCart.user.role;
    }
    return searchShoppingCart;
}

//Validaciones de Imagenes//
exports.validExtension = async (ext, filePath) => 
{
    try {
        if (ext == 'png' ||
            ext == 'jpg' ||
            ext == 'jpeg' ||
            ext == 'gif') {
            return true;

        } else {

            fs.unlinkSync(filePath);

            return false;

        }
    } 
    catch (err) 
    {
        console.log(err);
        return err;
    }
}