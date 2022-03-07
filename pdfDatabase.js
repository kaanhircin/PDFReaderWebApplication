const mongoose =require('mongoose')
const pdfSema =mongoose.Schema 

const blogPdfSema = new pdfSema ({
    pdf :{
        type: String,
        require : true 
    },
    yazan:{
        type: String,
        require: true 
    },
    adi :{
        type: String,
        require : true 
    },
    ozeti :{
        type: String,
        require : true 
    },
    donemi :{
        type: String,
        require : true 
    },
    konusu :{
        type: String,
        require : true 
    },
    anahtari :{
        type: String,
        require : true 
    },
    danismani :{
        type: String,
        require : true 
    },
    jurileri :{
        type: String,
        require : true 
    },
    kullanicisi :{
        type: String,
        require : true 
    }
    

})
const filedb = mongoose.model('filedb',blogPdfSema)
module.exports= filedb