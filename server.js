const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')
const Message = require('./models/Message')

app.use(express.static(`${__dirname}/ui`))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const mlab = require('./db_configs.json')
const uri = `mongodb://${mlab.user}:${mlab.password}@${mlab.host}/${mlab.database}`

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.json(messages)
    })
})

app.post('/messages', (req, res) => {
    if (req.body.name && req.body.contents) {
        let message = new Message(req.body)

        message.save().then(() => {
            return Message.findOne({ contents: 'badword' })
        }).then((badword) => {
            if(badword) {
                return Message.deleteOne({ _id: badword._id })
            }

            // emits to client side to pick up the changes
            io.emit('message', req.body)
            res.status(200)
        }).catch((err) => {
            console.log(err)
        })
    } else {
        res.status(400)
    }
})

io.on('connection', (socket) => {
    console.log('user is connected')
})

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (error) => {
    console.log('mongo connected', error)
})

const port = 8000;
const server = http.listen(port, () => {
    console.log(`App is live at port ${port}`)
})