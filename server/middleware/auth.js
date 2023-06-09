const {User} = require('./../models/user');

let auth = (req,res,next) => {
    let token = req.cookies.auth;

    User.findByToken(token,function(err,user){
        if(err) return err;
        if(!user) return res.json({error:true})
        req.token = token;
        req.user = user;
        next();
    })
}

module.exports = {auth}