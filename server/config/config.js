const config = {
    production:{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI,
    },
    default:{
        SECRET:'Secret2023@',
        DATABASE: 'mongodb://localhost:27017/book_shelf',
    }
}

exports.get = function get(env){
    return config[env] || config.default
}