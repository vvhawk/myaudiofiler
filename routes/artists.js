const { createECDH } = require('crypto')
const { errorMonitor } = require('events')
const express = require('express')
const { request } = require('http')
//const artist = require('../models/artist')
const router = express.Router()

const Artist = require('../models/artist')
const Album = require('../models/album')


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
    //res.render('artists/index')
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
    then((newArtist)=>{
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

// phase 5

router.get('/:id', async (req, res) => {
    try {
      const artist = await Artist.findById(req.params.id)
      const albums = await Album.find({ artist: artist.id }).limit(6).exec()
      res.render('artists/show', {
        artist: artist,
        albumsByArtist: albums
      })
    } catch {
      res.redirect('/')
    }
  })
  
  router.get('/:id/edit', async (req, res) => {
    try {
      const artist = await Artist.findById(req.params.id)
      res.render('artists/edit', { artist: artist })
    } catch {
      res.redirect('/artists')
    }
  })
  
  router.put('/:id', async (req, res) => {
    let artist
    try {
      artist = await Artist.findById(req.params.id)
      artist.name = req.body.name
      await artist.save()
      res.redirect(`/artists/${artist.id}`)
    } catch {
      if (artist == null) {
        res.redirect('/')
      } else {
        res.render('artists/edit', {
          artist: artist,
          errorMessage: 'Error updating Artist'
        })
      }
    }
  })

  //error at 21:47 not deleting
  
  router.delete('/:id', async (req, res) => {
    let artist
    try {
      artist = await Artist.findById(req.params.id)
      await artist.remove()
      res.redirect('/artists')
    } catch {
      if (artist == null) {
        res.redirect('/')
      } else {
        res.redirect(`/artists/${artist.id}`)
      }
    }
  })

module.exports = router //imported by server