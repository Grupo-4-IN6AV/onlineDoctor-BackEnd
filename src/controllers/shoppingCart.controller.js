'use strict';


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

        const msg = validateData(dataPrincipal);
        if (msg)
            return res.status(400).send(msg);

        const shoppingCartExist = await ShoppingCart.findOne({ user: user });
        const medicamentExist = await Medicament.findOne({ _id: params.medicaments })
        if (!medicamentExist)
            return res.send({message: 'Medicamento no encontrado.'});

        if (shoppingCartExist) 
        {
            if (params.quantity > medicamentExist.stock)
                return res.send({ message: 'No hay suficiente stock para este medicamento.' });
            for (var key = 0; key < shoppingCartExist.medicaments.length; key++) 
            {
                const idUpdateMedicament = shoppingCartExist.medicaments[key].medicament;
                if (idUpdateMedicament.valueOf() !== params.medicaments.valueOf()) continue;

                const setMedicament = 
                {
                    medicament: params.medicaments,
                    quantity: params.quantity,
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
                return res.send({ message: 'Cantidad del Producto Actualizada', addNewMedicament });
            }
            const setMedicament = 
            {
                medicament: params.medicaments,
                quantity: params.quantity,
                price: medicamentExist.price,
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
            return res.send({ message: 'Medicamento añadido.', newShoppingCart })
        }

       if (params.quantity > medicamentExist.stock)
            return res.send({ message: 'No hay suficiente stock para este medicamento.' });

        const setMedicament = 
        {
            medicament: params.medicaments,
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
        return res.send({ message: 'Medicamento añadido.', addShoppingCart });
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