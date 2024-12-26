const transaction_model = require("../models/transaction_model");

const  getallts=async(req,res)=>{
    try {
        const trs=await transaction_model.find({userid: req.body.userid})
        res.status(200).json(trs)
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
};

const  addts=async(req,res)=>{
    try {
        const newtr=new transaction_model(req.body);
        await newtr.save();
        res.status(201).send('Transaction created')
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
};

module.exports  ={getallts,addts};
