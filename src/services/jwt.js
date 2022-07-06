'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'NewJsonWebTokenSecret2022';

exports.createToken = async (user)=>
{
    try
    {
        const payload = 
        {
            sub: user._id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            role: user.role,
            iat: moment().unix(),
            exp: moment().add(10, 'hour').unix()
        }
        return jwt.encode(payload, secretKey);
    }
    catch(err)
    {
        console.log(err);
        return err
    }
}