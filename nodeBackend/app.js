const express = require("express")
const server = express()



let LocalHost = 8080



server.listen(LocalHost, ()=>{
    console.log(`Server is running at ${LocalHost}`)
})




