const { createECDH } = require('crypto')
const { errorMonitor } = require('events')
const express = require('express')
const { request } = require('http')
const router = express.Router()

const Album = require('../models/album')
const Artist = require('../models/artist')

const multer = require('multer')
const path = require('path')
const uploadPath = path.join('public', Album.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png','image/gif' ]
const fs = require('fs')

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) =>{
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// all albums route
router.get('/', async (req, res) => {
    let query = Album.find()
    if(req.query.title != null && req.query.title != '')
    {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.releasedBefore != null && req.query.releasedBefore != '')
    {
        query = query.lte('releaseDate', req.query.releasedBefore)
    }
    if(req.query.releasedAfter != null && req.query.releasedAfter != '')
    {
        query = query.gte('releaseDate', req.query.releasedAfter)
    }
    try{
        const albums = await query.exec()

        res.render('albums/index', {
            albums: albums,
            searchOptions: req.query
        })
    } catch{
        res.redirect('/')
    }

})

// new album route
router.get('/new', async (req, res) => {

    // try{
    //     const artists = await Artist.find()
    //     const album = new Album()
    //     res.render('albums/new', {
    //         artists: artists,
    //         album: album
    //     })
    // }catch{
    //     res.redirect('/albums')
    // }

    renderNewPage(res, new Album())
})

//create album route

router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const album = new Album({
        title: req.body.title,
        artist: req.body.artist,
        releaseDate: new Date(req.body.releaseDate),
        length: req.body.length,
        coverImageName: fileName,
        notes: req.body.notes
    })

    try{

        const newAlbum = await album.save()
        //res.redirect('albums/${newAlbum.id}')
        res.redirect('albums')

    

    }catch{

        if(album.coverImageName != null)
        {
            removeAlbumCover(album.coverImageName)
        }
        //removeAlbumCover(album.coverImageName)

        renderNewPage(res, album, true)
    }
})


// async function renderNewPage(res, album, hasError = false){
//     try{
//         const artists = await Artist.find()
//         const params = {
//             artists: artists,
//             album: album
//         }

//         if (hasError) params.errorMessage = 'Error Creating Album'
//         res.render('albums/new', params)
//     }catch{
//         res.redirect('/albums')
//     }
// }


// issues here 32:43
function removeAlbumCover(fileName)
{
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })

}







// Show album Route
router.get('/:id', async (req, res) => {
    try {
      const album = await Album.findById(req.params.id)
                             .populate('artist')
                             .exec()
      res.render('albums/show', { album: album })
    } catch {
      res.redirect('/')
    }
  })
  
  // Edit album Route
  router.get('/:id/edit', async (req, res) => {
    try {
      const album = await Album.findById(req.params.id)
      renderEditPage(res, album)
    } catch {
      res.redirect('/')
    }
  })
  
  // Update album Route
  router.put('/:id', async (req, res) => {
    let album
  
    try {
      album = await Album.findById(req.params.id)
      album.title = req.body.title
      album.artist = req.body.artist
      album.publishDate = new Date(req.body.publishDate)
      album.pageCount = req.body.pageCount
      album.description = req.body.description
      if (req.body.cover != null && req.body.cover !== '') {
        saveCover(album, req.body.cover)
      }
      await album.save()
      res.redirect(`/albums/${album.id}`)
    } catch {
      if (album != null) {
        renderEditPage(res, album, true)
      } else {
        res.redirect('/')
      }
    }
  })
  
  // Delete album Page
  router.delete('/:id', async (req, res) => {
    let album
    try {
      album = await Album.findById(req.params.id)
      await album.remove()
      res.redirect('/albums')
    } catch {
      if (album != null) {
        res.render('albums/show', {
          album: album,
          errorMessage: 'Could not remove album'
        })
      } else {
        res.redirect('/')
      }
    }
  })
  
  async function renderNewPage(res, album, hasError = false) {
    renderFormPage(res, album, 'new', hasError)
  }
  
  async function renderEditPage(res, album, hasError = false) {
    renderFormPage(res, album, 'edit', hasError)
  }
  
  async function renderFormPage(res, album, form, hasError = false) {
    try {
      const artists = await Artist.find({})
      const params = {
        artists: artists,
        album: album
      }
      if (hasError) {
        if (form === 'edit') {
          params.errorMessage = 'Error Updating album'
        } else {
          params.errorMessage = 'Error Creating album'
        }
      }
      res.render(`albums/${form}`, params)
    } catch {
      res.redirect('/albums')
    }
  }





module.exports = router //imported by server