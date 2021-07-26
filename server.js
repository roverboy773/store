

require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 5000
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport=require('passport');
const Emitter=require('events');
const cors=require('cors');

app.use(cors());
// Database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify : true });

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection failed...')
});


//Session store
let mongoStore = new MongoDbStore({
                mongooseConnection: connection,
                collection: 'sessions'
            })

//eventEmitter
const eventEmitter=new Emitter();
app.set('eventEmitter',eventEmitter);//binding eventEmiiter to the express app

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    store:mongoStore,   
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
}))

// Passport config


app.use(passport.initialize());
app.use(passport.session());

app.use(flash())

// Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/src/views'))
app.set('view engine', 'ejs')

require('./src/routes/route')(app)

app.use((req,res)=>{
  res.status(404).render('404');
})

 const server= app.listen(PORT , () => {
            console.log(`Listening on port ${PORT}`)
})

//Socket.io

//config to join rooom
const io=require('socket.io')(server);
io.on('connection',(socket)=>{
    socket.on('join',(roomName)=>{
      
       socket.join(roomName)
    })
})

//emit event in 'order_xyz' room listening event orderstatus from /admin/orders
eventEmitter.on('orderStatus',(data)=>{//data=order
   io.to(`order_${data.id}`).emit('orderUpdated',data);
})

//listening event from postOrder in orderControoler and sending to admin() in index.js
eventEmitter.on('reflectOrder',(data)=>{//data==order
   
   io.to('adminRoom').emit('reflectOrder1',data)
})

