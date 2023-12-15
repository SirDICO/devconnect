const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    name:{
        type: String,
        required: [true, 'Please provide name'],
    },
    email:{
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        // validate: {
        //     validator:validator.isEmail,
        //     message: 'Please provide a valid email'
        // },     
    }
,

password:{
    type:String,
    required: [true, 'Please provide password']
},
avatar:{
    type:String,
},
date: {
    type:Date,
    default:Date.now
}
})

module.exports = User = mongoose.model('user', UserSchema)