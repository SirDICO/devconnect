const mongoose = require('mongoose')
const config = require('config')

//DB connection string [URI]
const db = config.get('mongoURI')

//async function 
const connectDB = async () => {
    try{
        //this returns a promise so we use await alright
       await mongoose.connect(db)

       console.log('MongoDB Connected...')
    }catch(err){
        console.error(err.message)
        // Exit process with failure
        process.exit(1)
    }
}

module.exports = connectDB;