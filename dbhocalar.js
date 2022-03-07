const mongoose =require('mongoose')
const hocaSema = mongoose.Schema 

const blogHocaSema =new hocaSema ({
    hocaAdi:{
        type: String,
        require: true 
    },
    hocaSoyadi :{
        type: String,
        require : true 
    }
},{timestamps:true})
const hocalardb = mongoose.model('hocalardb',blogHocaSema)
module.exports= hocalardb