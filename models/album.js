const mongoose = require('mongoose')
const path = require('path')
const coverImageBasePath = 'uploads/albumCovers'

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    notes: {
        type: String,
    
    },
    releaseDate:{
        type: Date,
        required: true
    },
    length:{
        type: Number,
        
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName:{
        type: String,
        required: true
    },
    artist:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Artist'
    }
    
})

albumSchema.virtual('coverImagePath').get(function(){
    if (this.coverImageName != null){
        return path.join('/',coverImageBasePath,this.coverImageName)
    }
})

module.exports = mongoose.model('Album', albumSchema)

module.exports.coverImageBasePath = coverImageBasePath
