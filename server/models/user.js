const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config').get(process.env.NODE_ENV);
const SALT_I = 10;

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    name:{
        type:String,
        maxlength:100
    },
    lastname:{
        type:String,
        maxlength:100
    },
    role:{
        type:Number,
        default:0
    },
    token:{
        type:String
    }
})


userSchema.pre('save',function(next){
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(SALT_I,function(err,salt){
            if(err) return next(err)
    
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err)
                user.password = hash;
                next();
            })
        })
    }
    else{
        next();
    }
})

userSchema.methods.comparePassword = function(userPassword,cb){
    bcrypt.compare(userPassword,this.password,function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch);
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(),config.SECRET);

    user.token = token;
    user.save().then(doc=>{cb(null,doc)}).catch(e => cb(e));
}

userSchema.statics.findByToken = function(token,cb) {
    var user = this;
    jwt.verify(token,config.SECRET,function(err,decode){
        user.findOne({_id:decode,"token":token}).then(doc => cb(null,doc)).catch(e => cb(e))
    })
}

userSchema.methods.deleteToken = function(token,cb){
    var user = this;
    user.updateOne({$unset:{token:1}}).then(doc => cb(null,doc)).catch(e => cb(e))
}

const User = mongoose.model('User',userSchema);
module.exports = { User }