'use strict';


const { findOneAndDelete } = require('../models/medicament.model');
const Medicament = require('../models/medicament.model');
const ShoppingCart = require('../models/shoppingCart.model');
const User = require('../models/user.model');

const { validateData, detailsShoppingCart } = require('../utils/validate');


exports.testShoppingCart = (req, res) => {
    return res.send({ message: 'La función -Test Shopping Cart- esta corriendo.' });
}


exports.createShoppingCart = async (req, res) => 
{
    try 
    {
        const params = req.body;
        const user = req.user.sub;

        const dataPrincipal = 
        {
            medicament: params.medicaments,
            quantity: params.quantity,
        }

        console.log(dataPrincipal)

        const msg = validateData(dataPrincipal);
        if (msg)
            return res.status(400).send(msg);

        const shoppingCartExist = await ShoppingCart.findOne({ user: user });
        const medicamentExist = await Medicament.findOne({ _id: params.medicaments })
        if (!medicamentExist)
            return res.send({message: 'Medicamento no encontrado.'});

        if(dataPrincipal.quantity <= 0)    
            return res.status(400).send({message:'No se agregó cantidad a comprar'})

        if (shoppingCartExist) 
        {
            if (dataPrincipal.quantity > medicamentExist.stock)
                return res.status(400).send({ message: 'No hay suficiente stock para este medicamento.' });
            for (var key = 0; key < shoppingCartExist.medicaments.length; key++) 
            {
                const idUpdateMedicament = shoppingCartExist.medicaments[key].medicament;
                if (idUpdateMedicament.valueOf() !== params.medicaments.valueOf()) continue;

                const setMedicament = 
                {
                    medicament: params.medicaments,
                    name: medicamentExist.name,
                    quantity: params.quantity,
                    image: medicamentExist.image,
                    price: medicamentExist.price,
                    subTotalMedicament: parseFloat(params.quantity) * parseFloat(medicamentExist.price)
                }
        
                const dataSuma = 
                {
                    subTotal : setMedicament.subTotalMedicament,
                    IVA : parseFloat(setMedicament.subTotalMedicament) * 0.12,
                    total : parseFloat(setMedicament.subTotalMedicament) + parseFloat(setMedicament.subTotalMedicament) * 0.12,
                }
                 
                const addNewMedicament = await ShoppingCart.findOneAndUpdate(
                    { $and: [{ user: user }, { "medicaments.medicament": params.medicaments }] },
                    {
                        $inc:
                        {
                            "medicaments.$.quantity": params.quantity,
                            "medicaments.$.subTotalMedicament": setMedicament.subTotalMedicament,
                            subTotal : dataSuma.subTotal,
                            IVA: dataSuma.IVA,
                            total: dataSuma.total
                        },
                    },
                    { new: true }).lean();
                return res.send(addNewMedicament);
            }
            const setMedicament = 
            {
                medicament: params.medicaments,
                quantity: dataPrincipal.quantity,
                price: medicamentExist.price,
                name: medicamentExist.name,
                image: medicamentExist.image,
                subTotalMedicament: parseFloat(params.quantity) * parseFloat(medicamentExist.price)
            }
            const subTotal = shoppingCartExist.medicaments.map(item =>
                item.subTotalMedicament).reduce((prev, curr) => prev + curr, 0) + setMedicament.subTotalMedicament;
            const IVA = parseFloat(subTotal) * 0.12;
            const total = parseFloat(subTotal) + parseFloat(IVA);

            const newShoppingCart = await ShoppingCart.findOneAndUpdate({ _id: shoppingCartExist._id },
                {
                    $push: { medicaments: setMedicament },
                    subTotal: subTotal,
                    IVA: IVA,
                    total: total
                },
                { new: true });
            return res.send(newShoppingCart)
        }

       if (dataPrincipal.quantity > medicamentExist.stock)
            return res.send({ message: 'No hay suficiente stock para este medicamento.' });

        const setMedicament = 
        {
            medicament: params.medicaments,
            name: medicamentExist.name,
            image: medicamentExist.image,
            quantity: params.quantity,
            price: medicamentExist.price,
            subTotalMedicament: parseFloat(params.quantity) * parseFloat(medicamentExist.price)
        }

        const data = 
        {
            user: req.user.sub,
            medicaments: setMedicament
        }

        data.subTotal = setMedicament.subTotalMedicament
        data.IVA = parseFloat(data.subTotal) * 0.12;
        data.total = parseFloat(data.subTotal) + parseFloat(data.IVA);

        //BUSCAR NIT DEL USUARIO//
        const searchUser = await User.findOne({_id:user})
        if (searchUser.NIT == '' || searchUser.NIT == undefined || searchUser.NIT == null) 
        {
            data.NIT = 'C/F'
        }
        else { data.NIT = searchUser.NIT }

        const addShoppingCart = new ShoppingCart(data);
        await addShoppingCart.save();
        return res.send(addShoppingCart);
    } 
    catch (err) 
    {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al crear el Carrito de Compras.' });
    }
}

exports.getShoppingCart = async (req, res) => {
    try 
    {
        const user = req.user.sub;
        const shoppingCart = await ShoppingCart.findOne({ user: user }).populate('user medicaments.medicament')
        return res.send({ message: 'Este es tu carrito de compras. ', shoppingCart });
    } 
    catch (err) 
    {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener el Shopping Cart.' });
    }
}


exports.payShoppingCart = async (req, res) => {
    try 
    {
        const user = req.user.sub;
        const shoppingCart = await ShoppingCart.findOne({ user: user }).populate('user medicaments.medicament')
        const medicaments = shoppingCart.medicaments;

        for(let medicament of medicaments)
        {
            const searchMedicament = await Medicament.findOneAndUpdate({_id:medicament._id},
                {
                    $inc:{sales: medicament.quantity, stock:-medicament.quantity}
                })
        }
        const deleteShoppingCart = await ShoppingCart.findOneAndDelete({user:user});

        return res.send({ message: 'Su compra se proceso exitosamente'});
    } 
    catch (err) 
    {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al obtener el Shopping Cart.' });
    }
}