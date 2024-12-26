const mongoose=require('mongoose')
const color=require('colors')
const conectdb = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log(`server running on port ${mongoose.connection.host}`.bgCyan);
    } catch (err) {
        console.log(`${err}`.bgRed);
    }
}
module.exports=conectdb