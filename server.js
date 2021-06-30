require('dotenv').config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const PORT = process.env.PORT || 6600;
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo')

// database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL ,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:true
});
const connection = mongoose.connection;
connection.once('open', ()=>{
    console.log("Connection is successful, Database connected");
}).catch( (err) => {
    console.log("No connection");
}); 


// session store
// let mongoStore = new MongoDbStore({
//     mongooseConnection: connection,
//     collection: 'sessions'
// })

// session config
app.use(session({
    secret : process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({
        mongoUrl: process.env.MONGO_CONNECTION_URL
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } //about 24 hrs
}))


// use as middleware
app.use(flash())

// Assets
app.use(express.static('public'))
app.use(express.json())

// global middleware
app.use((req, res, next) =>{
    res.locals.session = req.session;
    next();
})

// set template engine
app.use(expressLayout)
app.set("views", path.join(__dirname, "/resources/views"))
app.set('view engine' , 'ejs')

require('./routes/web')(app)


app.listen(PORT, () => {
    console.log(`Listining to the port ${PORT}`);
})