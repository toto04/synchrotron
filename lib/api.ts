import express from 'express'
import socketio from 'socket.io'
import { createServer } from 'http'
import { lights, profileDB } from './init'

let api = express()
let server = createServer(api)
let io = socketio(server)

export function initializeApi(port: number) {
    server.listen(port)
    for (const light of lights) light.on('advance', buffer => {
        io.emit(light.name, buffer)
    })
    console.log("[Synchrotron API] Server initialized!")
}

api.use(express.json())

api.get('/lights', (req, res) => {
    res.send(lights.map(light => ({
        name: light.name,
        switchedOn: light.switchedOn,
        pixels: light.pixels.map(s => s.length)
    })))
})

api.get('/profiles/:light', async (req, res) => {
    let profiles = await profileDB.find({ light: req.params['light'] })
    res.send(profiles)
})

api.post('/:light/switch', (req, res) => {
    lights.find(l => l.name = req.params['light'])?.switch(req.body['on'])
    res.send()
})