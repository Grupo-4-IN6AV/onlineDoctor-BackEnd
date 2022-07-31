'use strict';


//Importación del Modelo -Medicament-
const Medicament = require('../models/medicament.model');

//Importación del Modelo -Categories-
const ShoppingCart = require('../models/shoppingCart.model');

const { validateData, detailsShoppingCart } = require('../utils/validate');


exports.testShoppingCart = (req, res) => {
    return res.send({ message: 'La función Test Shopping Cart esta corriendo.' });
}


exports.createShoppingCart = async (req, res) => {
    try {
        const params = req.body;
        const user = req.user.sub;

        const dataObligatoria = {
            products: params.products,
            quantity: params.quantity,
        }

        const msg = validateData(dataObligatoria);
        if (msg)
            return res.status(400).send(msg);

        const shoppingCartExist = await ShoppingCart.findOne({ user: user });
        const productExist = await Medicament.findOne({ _id: params.products }).lean();
        if (!productExist)
            return res.send({ message: 'Medicament no encontrado.' });

        if (shoppingCartExist) {
            if (params.quantity > productExist.stock)
                return res.send({ message: 'No hay suficiente stock para este producto.' });
            for (var key = 0; key < shoppingCartExist.products.length; key++) {
                const idUpdateProduct = shoppingCartExist.products[key].product;
                if (idUpdateProduct != params.products) continue;
                return res.send({ message: 'Ya tienes este producto en el carrito.' });
            }
            const setProduct = {
                medicament: params.products,
                quantity: params.quantity,
                price: productExist.price,
                subTotalProduct: parseFloat(params.quantity) * parseFloat(productExist.price)
            }
            const subTotal = shoppingCartExist.products.map(item =>
                item.subTotalProduct).reduce((prev, curr) => prev + curr, 0) + setProduct.subTotalProduct;
            const IVA = parseFloat(subTotal) * 0.12;
            const total = parseFloat(subTotal) + parseFloat(IVA);

            const newShoppingCart = await ShoppingCart.findOneAndUpdate({ _id: shoppingCartExist._id },
                {
                    $push: { products: setProduct },
                    subTotal: subTotal,
                    IVA: IVA,
                    total: total
                },
                { new: true });
            const shoppingCart = await detailsShoppingCart(newShoppingCart._id);
            return res.send({ message: 'Producto nuevo agregado al carrito de compras.', shoppingCart })
        }
        if (params.quantity > productExist.stock)
            return res.send({ message: 'No hay suficiente stock para este producto.' });

        const setProduct = {
            medicament: params.products,
            quantity: params.quantity,
            price: productExist.price,
            subTotalProduct: parseFloat(params.quantity) * parseFloat(productExist.price)
        }

        const data = {
            user: req.user.sub,
            products: setProduct
        }
        data.subTotal = setProduct.subTotalProduct
        data.IVA = parseFloat(data.subTotal) * 0.12;
        data.total = parseFloat(data.subTotal) + parseFloat(data.IVA);
        if (params.NIT == '' || params.NIT == undefined || params.NIT == null) {
            data.NIT = 'C/F'
        }
        else { data.NIT = params.NIT }

        const addShoppingCart = new ShoppingCart(data);
        await addShoppingCart.save();
        const shoppingCart = await detailsShoppingCart(addShoppingCart._id);
        return res.send({ message: 'Producto nuevo añadido.', shoppingCart });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al crear el Shopping Cart.' });
    }
}

exports.getShoppingCart = async (req, res) => {
    try {
        const user = req.user.sub;

        const cart = await ShoppingCart.findOne({ user: user }).populate('user')
        if (!cart) {
            return res.status(404).send({ message: 'No se encontro nada' });
        } else return res.send({ message: 'Este es tu carrito de compras. ', cart });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Obtener el Shopping Cart.' });
    }
}