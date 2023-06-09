//require is used to link libs from our dependencies

//.env database url: DATABASE_URL = mongodb://localhost/myAudiofiler

// .env database url: DATABASE_URL = mongodb+srv://bvasanth18:<4lq24v4NODY6mlp7>@myaudiofiler.iwn2ulf.mongodb.net/?retryWrites=true&w=majority


if(process.env.NODE_ENV !== 'production' ){
    require('dotenv').config()
}



const express = require('express') //imports express library
const app = express() //app portion
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const artistRouter = require('./routes/artists')
const albumRouter = require('./routes/albums')

app.set('view engine', 'ejs') // Embedded JavaScript Templating = view engine
app.set('views', __dirname + '/views') //where server rendered views coming from
app.set('layout', 'layouts/layout') //reuse layouts
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public')) // public views
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/artists', artistRouter) //prepend routes with 'artists'
app.use('/albums', albumRouter)

app.listen(process.env.PORT || 3000)