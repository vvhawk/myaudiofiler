const express = require('express')
const artist = require('../models/artist')
const router = express.Router()

const Artist = require('../models/artist')


// all artists route
router.get('/', (req, res) => {
    res.render('artists/index')
})

// new artist route
router.get('/new', (req, res) => {
    res.render('artists/new', {artist: new Artist()})
})

//create artist route

router.post('/', (req, res) => {
    res.send('Create')
})

module.exports = router //imported by server