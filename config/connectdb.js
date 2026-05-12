const mongoose=require('mongoose')
const color=require('colors')
const conectdb = async()=>{
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error('MONGODB_URL is required.');
        }

        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        await mongoose.connect(process.env.MONGODB_URL)
        console.log(`server running on port ${mongoose.connection.host}`.bgCyan);
        return mongoose.connection;
    } catch (err) {
        console.log(`${err}`.bgRed);
        throw err;
    }
}
module.exports=conectdb
