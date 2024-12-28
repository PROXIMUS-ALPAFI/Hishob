const mongoose = require('mongoose')
const transaction_schema = new mongoose.Schema({
    userid:{
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: [true, 'Amount is Required']
    },
    type:{
        type:String,
        required: [true, 'type is Required']
    },
    category: {
        type: String,
        required: [true, 'category is Required']
    },
    description: {
        type: String,
        required: [true, 'description is Required']
    },
    reference: {
        type: String,
    },
    date: {
        type: Date,
        required: [true, 'date is Required']
    }
}, { timestamps: true })
const transaction_model = mongoose.model('transctions', transaction_schema)
module.exports=transaction_model

