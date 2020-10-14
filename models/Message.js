const mongoose = require('mongoose')

let Message = mongoose.model('Message', {
    name: String,
    contents: String
})

module.exports = Message