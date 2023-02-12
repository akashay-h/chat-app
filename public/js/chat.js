//Challenge 4
//? Goal:Share coordinates with users
//! 1.Have client emit "sendLocation" with an object as the data
//! -Object should contain latitude and location properties
//! 2. Server should listen for "sendLocation"
//! -When fired ,send a "message" to all connected clients "Location:longitude,latitude"
//! 3.Test your work
//!-------------------------------------------------------------------------------------------------

//Challenge 5
//? Goal:Setup acknowledgment
//! 1.Setup the client acknowledgment function
//! 2.Setup the server to send back the acknowledgment
//! 3. Have the client print "Location shared!" when acknowledgment
//! 4.Test your work
//!-------------------------------------------------------------------------------------------------


//Challenge 6
//? Goal:Disable the send location button while location being sent
//! 1.Setup a selector at the top of the file
//! 2.Disable the button just before getting the current position
//! 3. Enable the button in the acknowlwdgment callback
//! 4.Test your work
//!-------------------------------------------------------------------------------------------------


//Challenge 7
//? Goal:Create a seperate event for location sharing messages
//! 1. Have sever emit "locationMessage" with url
//! 2.Have the client listen for "locationMessage" and print the url to the console
//! 3. Test your Work by sharing a location
//!-------------------------------------------------------------------------------------------------

//Challenge 8
//? Goal:Render new template location message
//! 1. Duplicate the message template
//! - Change the id something else
//! 2.Add link inside the paragraph with the link text "My current location"
//!  -URL for link should be the maps url (dynamic)
//! 3. Select the template from javascript
//! 4.Render the template with the url and append to message  list
//! 5.Test your work
//!-------------------------------------------------------------------------------------------------

//Challenge 9
//? Goal: Add timestamps for location message
//! 1. Create generateLocationMessage and export
//!  -{url:'',createdAt:0}
//! 2.Use generateLocationMessage when server emits locationMessage
//! 3.Update template to render time before the url
//! 4.Compile the template with the URL and the formatted time
//! 5. Test your work
//!-------------------------------------------------------------------------------------------------

//Challenge 13
//? Goal: Deploy the chat application
//! 1.Setup Git and commit files
//! -Ignored node_modules folder
//! 2.Setup a GitHub and push code up
//! 3. Setup a Heroku app and push code up
//! 4.Open the live app Test your work!
//!-------------------------------------------------------------------------------------------------



const socket = io()

//!Elements
const $messageForm =document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages =document.querySelector('#messages')



//? Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//!Option
//! ignoreQueryPrefix: true ==> this make sure that question mark goes away
const { username , room } = Qs.parse(location.search , { ignoreQueryPrefix: true }) 

const autoscroll = ( ) =>{
// New message element
const $newMessage = $messages.lastElementChild

// HEight of the new messsage
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible Height
    const visibleHeight = $messages.offsetHeight

   // Height of messages container
   const containerHeight = $messages.scrollHeight
    
   //How far have I scrolled?
   const scrollOffset = $messages.scrollTop + visibleHeight

   if ( containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
   }

}

socket.on('message' ,(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate ,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend' ,html)
    autoscroll()
})

socket.on('locationMessage', (message)=>{
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend' ,html)
    autoscroll()


})
  socket.on('roomData' , ({room , users})=>{
      const html = Mustache.render(sidebarTemplate ,{
        room,
        users
       })
    document.querySelector('#sidebar').innerHTML = html
  })

$messageForm.addEventListener('submit' ,(e)=>{
    e.preventDefault()

       $messageFormButton.setAttribute('disabled' , 'disabled')

    //!disable
    const message = e.target.elements.message.value
    
    socket.emit('sendMessage' , message, (error) =>{
 
        $messageFormButton.removeAttribute('disabled')
        
        //!To clear the input
        $messageFormInput.value = ''
        $messageFormInput.focus() 

       //!enable

        if (error) {
            return console.log(error);
            
        }
        console.log('Message delivered!');
        
    })
     
})

$sendLocationButton.addEventListener('click',() => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

   $sendLocationButton.setAttribute('disabled' , 'disabled')

    navigator.geolocation.getCurrentPosition((position) =>{
    
        socket.emit('sendLocation' ,{
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    },() =>{
        $sendLocationButton.removeAttribute('disabled')
        console.log('Location shared !');
        
    })
    })
})


socket.emit('join' ,{ username , room} , (error) => {
    if (error) {
        alert(error)
        location.href ='/'
    }
})


// socket.on('countUpdated', (count)=>{
//     console.log('The count has been updated!', count);
    
// })

// document.querySelector('#increment').addEventListener('click' ,() =>{
//     console.log('Clicked'); 
//     socket.emit('increment')
    
// })