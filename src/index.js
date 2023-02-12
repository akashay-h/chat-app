// Challenges for making chat application
// Challenges1
//? Goal:Create an Express web Server
//! 1.Intialize npm and install Express
//! 2.Setup a new Express Server
//!  -Serve up the Public directory
//!  -Listen on Port 3000
//! 3. Create index.html and render "CHAT App" to the Screen
//! 4.Test your work! Start the server and veiw the page in the browser

//! -------------------------------------------------------------------------------------------------------------------------------------------------//!
// Challenge 2
//? Goal:Setup script in package.json
//! 1.Create a "start" script to start app using node
//! 2.Install a nodemon and development dependency
//! 3.Create a "dev" script to start the app using nodemon
//! 4.Run both script to test your work!
//!----------------------------------------------------------
// Challenge 3
//? Goal:Send a welcome message to new user
//! 1. Have server emit "message" when new client connect
//!  - Send "welcome"! as the eevent data
//! 2.Have client listen for "message" event and print the message to console
//! 3. Test you work!
//!----------------------------------------------------------

// Challenge 4
//? Goal:Allow clients to send message
//! 1.Create a form with an input and button
//! -Similar to the weather form
//! 2.Setup event listener for form submissions
//! -Emit "sendMessage" with input string as message data
//! 3.Have server listen for "sendMessage"
//! -Send message to all connected clients
//! 4.Test your work!!
//!----------------------------------------------------------

// Challenge 11
//? Goal:Send Message to Correct Room
//! 1.Use getUser inside "sendMessage" event handler to get user data
//! 2. EMit the message to their current room
//! 3.Test your work
//! 3.Repeat for "sendLocation"
//!----------------------------------------------------------

// Challenge 12
//? Goal:Render username for text messages
//!  1.Setup the server to send username to client
//!  2.Edit Every call to "genrateMessage" to include username
//! - Use "Admin" for sts message like connect /Welcome /Disconnect
//! 3.Update client to render username in template
//! 4. Test your Work!
//!----------------------------------------------------------




const path = require('path') //! path is core node module
const http = require('http')
const express = require('express')
const socketio = require('socket.io') //! socket io library
const Filter = require('bad-words')
const { genrateMessage, generateLocationMessage } = require('./utilis/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utilis/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count =0

io.on('connection', (socket) => {
    console.log('New WebSocket connection');




    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }


        socket.join(user.room)
        socket.emit('message', genrateMessage('Admin','Welcome !'))

        socket.broadcast.to(user.room).emit('message', genrateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData' ,{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })





    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profaity is not allowed!')
        }

        io.to(user.room).emit('message', genrateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username ,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
     io.to(user.room).emit('message', genrateMessage('Admin',`${user.username} has Left`))
     io.to(user.room).emit('roomData' ,{
        room:user.room,
        users:getUsersInRoom(user.room)
     })
}


    })


})

// app.listen(port,() =>{
//     console.log(`Server is listening on port ${port}! `);

// })
server.listen(port, () => {
    console.log(`Server is listening on port ${port}! `);

})





