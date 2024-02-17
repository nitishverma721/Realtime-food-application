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
const passport = require("passport")

// database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL ,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const connection = mongoose.connection;
connection.on('error', (err) => {
    console.log("No connection", err);
});
connection.once('open', ()=>{
    console.log("Connection is successful, Database connected");
})




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

// Passport config
const passportInit = require("./app/config/passport")
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


// use as middleware
app.use(flash())

// Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended : false}))
app.use(express.json())

// global middleware
app.use((req, res, next) =>{
    res.locals.session = req.session;
    res.locals.user = req.user;
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