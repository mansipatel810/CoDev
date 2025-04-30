const mongoose = require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

const userSchema = mongoose.Schema({
    userName:{
        type: String,
        required: true,
        trim: true,
        unique: [ true, 'User name must be unique' ],
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [ 6, 'Email must be at least 6 characters long' ],
        maxLength: [ 50, 'Email must not be longer than 50 characters' ]
    },
    password:{
        type: String,
        required: true,
        select: false,
    }
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isValidPassword=async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT=async function(){
    const token = await jwt.sign(
        {email:this.email},
        process.env.JWT_SECRET,
        {expiresIn: '24h'}
    );
    return token;
}

const User = mongoose.model('User', userSchema);
module.exports = User;