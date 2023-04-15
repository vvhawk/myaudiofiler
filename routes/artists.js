const { createECDH } = require('crypto')
const { errorMonitor } = require('events')
const express = require('express')
const { request } = require('http')
const artist = require('../models/artist')
const router = express.Router()

const Artist = require('../models/artist')


// all artists route
router.get('/', async (req, res) => {

    let searchOptions = {}

    if(req.query.name != null && req.query.name != '')
    {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{

        const artists = await Artist.find(searchOptions)
        res.render('artists/index', { artists: artists, searchOptions: req.query})

    }catch{

        res.redirect('/')
    }
    res.render('artists/index')
})

// new artist route
router.get('/new', (req, res) => {
    res.render('artists/new', {artist: new Artist()})
})

//create artist route

router.post('/', async (req, res) => {
    
    const artist = new Artist({
        name: req.body.name
    })


    // model.prototype.save() no longer accepts a callback, following code doesnt work

    // artist.save((err, newArtist) => {
    //     if (err){
    //         res.render('artists/new', {
    //             artist: artist,
    //             errorMessage: 'Error creating artist'
    //         })
    //     } else {
    //         //res.redirect('artists/${newArtist.id}')
    //         res.redirect(`artists`)
    //     }
    // })


    // use this instead 

    artist.save().
    then((newAuthor)=>{
        //res.render('artists')
        res.redirect(`artists`)
    }).
    catch((err)=>{
        res.render('artists/new',{
            artist: artist,
            errorMessage:'Error Creating Artist...'
        })
    })

    //res.send(req.body.name)
})

module.exports = router //imported by server