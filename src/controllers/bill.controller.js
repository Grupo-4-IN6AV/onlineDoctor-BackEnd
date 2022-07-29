' use strict '

//Importación del Modelo -Bill-
const Bill = require('../models/bill.model');

//Importación del Modelo -ShoppingCart-
const ShoppingCart = require('../models/shoppingCart.model');

//Importación del Modelo -Medicament-
const Medicament = require('../models/medicament.model');

//Función de testeo
exports.testBill = (req, res)=>{
    return res.send({message: 'La Función test -Bill- esta funcionando.'});
}


//Función para crear una Bill
exports.createBill = async (req,res)=>{
    try{
        const userId = req.user.sub;
        const payShoppingCart = await ShoppingCart.findOne({user:userId}).lean();
        
        //Verificar que el Carrito tenga Productos//
        if(!payShoppingCart)
            return res.send({message:'Carrito de compras vacío, añadir productos.'})

        //Capturar la Fecha Actual.//
        const date = new Date();

        //Generador de Codigos de
        const bills = await Bill.count().lean();

        const shoppingCartBuy = 
        {
            //Seteando la Fecha Actual.//
            date: date.toISOString().split('T')[0],
            numberBill: bills+1000,
            user: payShoppingCart.user,
            NIT: payShoppingCart.NIT,
            products: payShoppingCart.products,
            IVA: payShoppingCart.IVA,
            subTotal: payShoppingCart.subTotal,
            total: payShoppingCart.total
        }

        //Guardar la Factura.//
        const bill = new Bill(shoppingCartBuy);
        await bill.save();
        
        //Actualizar el stock y el sale del Producto//
        // - Validar que duplique los productos del carrito.//
        for(var key = 0; key < payShoppingCart.products.length; key++)
        {
            //ID de cada Producto del Carrito.//
            const idUpdateProduct = payShoppingCart.products[key].medicament.valueOf();
            //Quantity - CARRITO//
            var productQuantity = payShoppingCart.products[key];
            //Obtener Stock y Sales de los Productos del Carrito.//
            const medicament = await Medicament.findOne({_id:idUpdateProduct});

            const productUpdated = await Medicament.findOneAndUpdate(
                {_id:idUpdateProduct},
                {
                    stock: parseInt(medicament.stock) - parseInt(productQuantity.quantity),
                    sales: parseInt(medicament.sales) + parseInt(productQuantity.quantity)
                },
                {new:true}).lean();
        }
           
        const cleanShoppingCart = await ShoppingCart.findOneAndDelete(
            {_id:payShoppingCart._id});
        const viewBill = await Bill.findOne({_id:bill._id})
        return res.send({message:'Factura generada con éxito.',viewBill});     


    }catch(err){
        console.log(err);
        return res.status(500).send({ err, message: 'Error al Crear la factura.' });
    }
}