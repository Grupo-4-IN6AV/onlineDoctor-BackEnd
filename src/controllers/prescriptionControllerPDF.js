' use strict '

//Importación del Modelo -Product-
const Medicament = require('../models/medicament.model');
const Laboratory = require('../models/laboratory.model');
const PreviewPrescription = require('../models/previewPrescription.model');

const express = require('express'),
app = express(),
pdf = require('html-pdf'),
fs = require('fs');

// Constantes propias del programa
const ubicacionPlantilla = require.resolve('../html/prescription.html');
var port = 3000;
app.listen(port, async()=>{})
// Estos productos podrían venir de cualquier lugar

exports.savePDF = async(prescription,res)=>
{
    try
    {
        let contenidoHtml = '';
        contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8');

        //Split de la Fecha//
        let date = prescription.date.split('T');
        let setDate = date[0];

        //numero de Receta//
        let number = await (await PreviewPrescription.find({})).count()
        let numberPreview = number+1000
       
        // Remplazar el valor {{tablaProductos}} por el verdadero valor

        // Y también los otros valores
        contenidoHtml = contenidoHtml.replace("{{namePacient}}", `${prescription.pacient.name}`);
        contenidoHtml = contenidoHtml.replace("{{nameDoctor}}", `${prescription.doctor.name}`);
        contenidoHtml = contenidoHtml.replace("{{prescriptionDate}}", `${setDate}`);
        contenidoHtml = contenidoHtml.replace("{{numberPrescription}}", `${setDate}`);
        contenidoHtml = contenidoHtml.replace("{{numberPrescription}}", `${numberPreview}`);

        //localhost:3000/Factura{{numberBill}}
    
        var config = 
        {
            "format": "Letter",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
            "orientation": "portrait", // portrait or landscape
          
            // Page options
            "border": "0",             // default is 0, units: mm, cm, in, px
        }
          

        let get = app.get(`/Bill${prescription._id}/`,(req,res)=>
        {
            pdf.create(contenidoHtml,config).toStream((error, stream) => {
            if (error) {
                res.end("Error creando PDF: " + error)
            } else {
                res.setHeader("Content-Type", "application/pdf");
                console.log('PDF creado Exitosament.')
                stream.pipe(res);
            }
        });
        }) 
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}