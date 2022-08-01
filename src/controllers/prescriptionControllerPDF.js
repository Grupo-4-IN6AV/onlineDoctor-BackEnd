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
        let date = prescription.date.toLocaleString().split(' ')
        let dateDos = date[0].split('/')
        if(dateDos[1] < 10)
        {
            dateDos[1] = '0'+dateDos[1]
        }

        //numero de Receta//
        let number = await  PreviewPrescription.count()
        let numberPreview = number+1000
        let setDate = dateDos[0]+'-'+dateDos[1]+'-'+dateDos[2]


        //DATA DE LA RECETA
        contenidoHtml = contenidoHtml.replace("{{prescriptionDate}}", `${setDate}`);
        contenidoHtml = contenidoHtml.replace("{{numberPrescription}}", `${numberPreview}`);

        // Y también los otros valores
        //DATOS DEL PACIENTE//
        contenidoHtml = contenidoHtml.replace("{{namePacient}}", `${prescription.pacient.name} ${prescription.pacient.surname}`);
        var generoPaciente 
        if(prescription.pacient.gender === 'MALE')
        {
            generoPaciente = 'MASCULINO'
        }

        else if(prescription.pacient.gender === 'FEMALE')
        {
            generoPaciente = 'FEMENINO'
        }

        contenidoHtml = contenidoHtml.replace("{{namePacient}}", `${prescription.pacient.name} ${prescription.pacient.surname}`);
        var generoPaciente 
        if(prescription.pacient.gender === 'MALE')
        {
            generoPaciente = 'MASCULINO'
        }

        else if(prescription.pacient.gender === 'FEMALE')
        {
            generoPaciente = 'FEMENINO'
        }

        contenidoHtml = contenidoHtml.replace("{{phonePacient}}", `${prescription.pacient.phone}`);
        contenidoHtml = contenidoHtml.replace("{{emailPacient}}", `${prescription.pacient.email}`);
        contenidoHtml = contenidoHtml.replace("{{agePacient}}", `${prescription.pacient.age}`);
        contenidoHtml = contenidoHtml.replace("{{genderPacient}}", `${generoPaciente}`);

        //DATOS DEL DOCTOR//
        contenidoHtml = contenidoHtml.replace("{{nameDoctor}}", `${prescription.doctor.name} ${prescription.doctor.surname}`);
        contenidoHtml = contenidoHtml.replace("{{numberCollegiate}}", `${prescription.doctor.collegiateNumber}`);
        contenidoHtml = contenidoHtml.replace("{{emailDoctor}}", `${prescription.doctor.email} ${prescription.doctor.surname}`);
        contenidoHtml = contenidoHtml.replace("{{phoneDoctor}}", `${prescription.doctor.phone} ${prescription.doctor.surname}`);

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
            pdf.create(contenidoHtml).toStream((error, stream) => {
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