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

api.get('/lights/', async (req, res) => {
    res.send(await Promise.all(lights.map(async light => {
        const profiles = (await profileDB.find({ light: light.name })).map(p => p.name)
        return {
            name: light.name,
            switchedOn: light.switchedOn,
            selectedProfileIndex: light.profile ? profiles.indexOf(light.profile.name) : -1,
            profiles,
            pixels: light.pixels.map(s => s.length)
        }
    })))
})

api.post('/lights/:light/profile', async (req, res) => {
    let name: string = req.body['profile']
    let profile = await profileDB.findOne({ name })
    if (profile) lights.find(l => l.name == req.params['light'])?.setProfile(profile)
    res.send()
})

api.get('/lights/:light/profiles', async (req, res) => {
    let light: string = req.params['light']
    let profiles = await profileDB.find({ light })
    let currLight = lights.find(l => l.name == light)
    let profile = profiles.find(p => p.name == currLight?.profile?.name)
    res.send({ profiles, selectedProfileIndex: profile ? profiles.indexOf(profile) : -1, dimensions: currLight?.pixels.map(s => s.length) })
})

api.post('/lights/:light/layers/:layer/indexes', async (req, res) => {
    let light = lights.find(l => l.name == req.params['light'])
    let layerIdx: number = parseInt(req.params['layer'])
    if (light?.profile) light.modifyLayer(layerIdx, Object.assign({}, light.profile.layers[layerIdx], { pixelIndexes: req.body['indexes'] }))
    res.send()
})

api.post('/lights/:light/switch', (req, res) => {
    lights.find(l => l.name = req.params['light'])?.switch(req.body['on'])
    res.send()
})