'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'NewJsonWebTokenSecret2022';

exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La petición no contiene la cabecera de autenticación'});
    }else{
        try{
            var token = req.headers.authorization.replace(/['"]+/g, '');
            var payload = jwt.decode(token, secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'token expirado'});
            }
        }catch(err)
        {
            console.log(err);
            return res.status(404).send({message: 'El token no es valido'});
        }
        req.user = payload;
        next();
    }
}

exports.isAdmin = async (req, res, next)=>
{
    try
    {
        const user = req.user;
        if(user.role === 'ADMINISTRADOR') return next();
        else return res.status(403).send({message: 'Usario No Autorizado'});
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}