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

exports.savePDF = async(req,res)=>
{
    try
    {

        idReceta = req.params.id;
        var prescription = await PreviewPrescription.findOne({_id:idReceta}).populate('medicaments pacient doctor laboratorys')
        console.log(prescription)
        let contenidoHtml = '';
        contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8');

        var tabla = "";
        var tablaDos = "";

        //Medicamentos de la Receta//
        for(let laboratory of prescription.laboratorys)
        {
            var index = prescription.laboratorys.indexOf(laboratory) 
            var searchLaboratory = await Laboratory.findOne({_id:laboratory._id}).populate('typeLaboratory')
            tablaDos += 
            `<tr>
                <td>${index+1}</td>
                <td>${searchLaboratory.typeLaboratory.name}</rd>
            </tr>`
        }


        for(let medicament of prescription.medicaments)
        {
            
            var setMedicament = medicament.name;
            var index = prescription.medicaments.indexOf(medicament) 
            var searchMedicament = await Medicament.findOne({_id:medicament._id}).populate('typeMedicament')
            tabla += 
            `<tr>
                <td>${index+1}</td>
                <td>${setMedicament}</td>
                <td>${searchMedicament.typeMedicament.name}</rd>
            </tr>`
        }

        //numero de Receta//
        let number = await  PreviewPrescription.count()
        let numberPreview = number+1000


        //DATA DE LA RECETA
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

        contenidoHtml = contenidoHtml.replace("{{tableMedicaments}}", `${tabla}`);
        contenidoHtml = contenidoHtml.replace("{{tableLaboratories}}", `${tablaDos}`);

        //localhost:3000/Factura{{numberBill}}
    
        var config = 
        {
            "format": "Letter",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
            "orientation": "portrait", // portrait or landscape
          
            // Page options
            "border": "0",             // default is 0, units: mm, cm, in, px
        }

        let get = app.get(`/Receta/${prescription._id}/`,(req,res)=>
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
        return res.send({get})
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}