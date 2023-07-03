const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const app = express();
const config = require('./config/config').get(process.env.NODE_ENV);

// mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE);

const { User } = require('./models/user');
const { Book } = require('./models/book')
app.use(bodyParser.json());
app.use(cookieParser());

// GET //
app.get('/api/get-book',(req,res)=> {
    let id = req.query.id;
    Book.findById(id).then(doc => res.send(doc)).catch(e => res.status(400).send(e))
})

app.get('/api/get-books',(req,res)=> {
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;

    // order is equal asc || desc
    Book.find().skip(skip).sort({_id:order}).limit(limit).exec().then(doc => res.send(doc)).catch(e => res.status(400).send(e))
})

app.get('/api/get-reviewer',(req,res)=> {
    let id = req.query.id;
    User.findById(id).then(doc => res.json({
        name:doc.name,lastname:doc.lastname
    })).catch(e => res.status(400).send(e))
})

app.get('/api/users',(req,res)=> {
    User.find().then(users => res.status(200).send(users)).catch(e => res.status(400).send(e))
})

// POST //
app.post('/api/book',(req,res)=> {
    const book = new Book(req.body);
    book.save().then(doc => res.status(200).json({
        post:true,
        bookId:doc._id 
    })).catch(e => res.status(400).send(e))
})

app.post('/api/register',(req,res) => {
    const user = new User(req.body);
    user.save().then(doc => res.status(200).json({success:true,user:doc})).catch(e => res.status(400).send(e));
})

app.post('/api/login',(req,res)=> {
    User.findOne({'email':req.body.email}).then(doc=>{
        doc.comparePassword(req.body.password,function(err,isMatch){
            if(!isMatch) return res.json({isAuth:false,message:'Wrong Password'});
            doc.generateToken((err,user)=> {
                if(err) return res.status(400).send(e);
                res.cookie('auth',user.token).json({
                    isAuth:true,
                    id:user._id,
                    email:user.email
                })
            })
        })
    }).catch(e => res.status(400).send({isAuth:false, message:'Auth Failed! Email Not Found'}))
})

// UPDATE //
app.post('/api/book-update',(req,res)=> {
    Book.findByIdAndUpdate(
        req.body._id,
        req.body,
        {new:true}
    ).then(doc => res.json({success:true,doc})).catch(e => res.status(400).send(e))
})
// DELETE //
app.delete('/api/delete-book',(req,res)=> {
    let id = req.query.id;
    Book.findByIdAndDelete(id).then(doc => res.json(true)).catch(e => res.status(400).send(e))
})

const port = process.env.PORT || 3001;
app.listen(port,()=> console.log('server is running'));