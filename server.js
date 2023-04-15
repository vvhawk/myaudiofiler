//require is used to link libs from our dependencies

//.env database url: DATABASE_URL = mongodb://localhost/myAudiofiler

if(process.env.NODE_ENV !== 'production' ){
    require('dotenv').config()
}


const express = require('express') //imports express library
const app = express() //app portion
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')

app.set('view engine', 'ejs') // Embedded JavaScript Templating = view engine
app.set('views', __dirname + '/views') //where server rendered views coming from
app.set('layout', 'layouts/layout') //reuse layouts
app.use(expressLayouts)
app.use(express.static('public')) // public views


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)

app.listen(process.env.PORT || 3000)