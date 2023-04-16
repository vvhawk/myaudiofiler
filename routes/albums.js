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
res.send('All Albums')
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
    const fileName = req.file != null ? req.file.fieldname : null
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
        res.redirect('albums/${newAlbum.id}')
        res.redirect('albums')

        print("hello")

    }catch{

        if(album.coverImageName != null)
        {
            removeAlbumCover(album.coverImageName)
        }
        //removeAlbumCover(album.coverImageName)

        renderNewPage(res, album, true)
    }
})


async function renderNewPage(res, album, hasError = false){
    try{
        const artists = await Artist.find()
        const params = {
            artists: artists,
            album: album
        }

        if (hasError) params.errorMessage = 'Error Creating Album'
        res.render('albums/new', params)
    }catch{
        res.redirect('/albums')
    }
}


// issues here 32:43
function removeAlbumCover(fileName)
{
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })

}



module.exports = router //imported by server