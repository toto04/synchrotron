import express from 'express'
import { createServer } from 'http'
import WebSocket from 'ws'
import { lights, profileDB } from './init'
import { ProfileConfig } from 'types'

let api = express()
let server = createServer(api)
const wss = new WebSocket.Server({ server })
let wsClients: Map<String, Set<WebSocket>> = new Map()
wss.on('connection', (ws) => {
    wsClients.get(ws.protocol)?.add(ws)
    ws.on('close', () => wsClients.get(ws.protocol)?.delete(ws))
})

export function initializeApi(port: number) {
    server.listen(port)
    for (const light of lights) {
        wsClients.set(light.name, new Set())
        light.on('advance', buffer => {
            wsClients.get(light.name)?.forEach(ws => {
                ws.send(buffer)
            })
        })
    }
    console.log(`[Synchrotron API] Server initialized on port ${port}!`)
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
    let lightName: string = req.params['light']
    let profile = await profileDB.findOne({ name, light: lightName })
    if (profile) lights.find(l => l.name == lightName)?.setProfile(profile)
    res.send()
})

api.delete('/lights/:light/profile/:profile', async (req, res) => {
    let name: string = req.params['profile']
    let lightName: string = req.params['light']
    await profileDB.remove({ name, light: lightName })
    lights.find(l => l.name == lightName)?.resetProfile()
    res.send()
})

api.route('/lights/:light/profiles')
    .get(async (req, res) => {
        let light: string = req.params['light']
        let profiles = await profileDB.find({ light })
        let currLight = lights.find(l => l.name == light)
        let profile = profiles.find(p => p.name == currLight?.profile?.name)
        res.send({ profiles, selectedProfileIndex: profile ? profiles.indexOf(profile) : -1, dimensions: currLight?.pixels.map(s => s.length) })
    })
    .post(async (req, res) => {
        let light = lights.find(l => l.name == req.params['light'])
        if (light) {
            let newProfile: ProfileConfig = {
                layers: [],
                light: light?.name,
                name: req.body['newProfileName']
            }
            light.setProfile(newProfile)
            await profileDB.insert(newProfile)
        }
        res.send()
    })

api.post('/lights/:light/layers', async (req, res) => {
    // creates a new layer
    let light = lights.find(l => l.name == req.params['light'])
    let config = req.body['config']
    light?.addLayer(config)
    res.send()
})

api.delete('/lights/:light/layers/:layer', async (req, res) => {
    let light = lights.find(l => l.name == req.params['light'])
    let layerIdx: number = parseInt(req.params['layer'])
    light?.deleteLayer(layerIdx)
    res.send()
})

api.post('/lights/:light/layers/:layer/indexes', async (req, res) => {
    // sets the new indexes of a layer 
    let light = lights.find(l => l.name == req.params['light'])
    let layerIdx: number = parseInt(req.params['layer'])
    if (light) light.modifyLayer(layerIdx, Object.assign({}, light.layers[layerIdx].toObject(), { pixelIndexes: req.body['indexes'] }))
    res.send()
})

api.post('/lights/:light/layers/:layer/options', async (req, res) => {
    // changes options for a layer
    let light = lights.find(l => l.name == req.params['light'])
    let layerIdx: number = parseInt(req.params['layer'])
    if (light) light.modifyLayer(layerIdx, Object.assign({}, light.layers[layerIdx].toObject(), { options: req.body['options'] }))
    res.send()
})

api.post('/lights/:light/switch', (req, res) => {
    lights.find(l => l.name = req.params['light'])?.switch(req.body['on'])
    res.send()
})