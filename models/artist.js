const mongoose = require('mongoose')
const Album = require('./album')

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

artistSchema.pre('remove', function(next) {
    Album.find({ artist: this.id }, (err, albums) => {
      if (err) {
        next(err)
      } else if (albums.length > 0) {
        next(new Error('This artist has albums still'))
      } else {
        next()
      }
    })
  })

// artistSchema.pre("deleteOne", async function (next) {
//     try {
//         const query = this.getFilter();
//         const hasAlbum = await Album.exists({ artist: query._id });
  
//         if (hasAlbum) {
//             next(new Error("This artist still has albums"));
//         } else {
//             next();
//         }
//     } catch (err) {
//         next(err);
//     }
// });


module.exports = mongoose.model('Artist', artistSchema)
