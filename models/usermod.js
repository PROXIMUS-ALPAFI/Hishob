const mongoose=require('mongoose')

//design schema
const usersch=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is requied']
    },
    email:{
        type:String,
        required:[true,'Email id is requiered'],
        unique:true
    },
    password:{
        type:String,
        required:[true,'passcode is requiered']

    }
},
{
    timestamps:true
})
const userMod=mongoose.model('users',usersch)
module.exports = userMod;
