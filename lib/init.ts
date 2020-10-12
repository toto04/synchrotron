import config from 'config'
import { createSocket } from 'dgram'
import { DataStore } from './DataStore'
import { Light, LightConfig } from './lights'

export let lights: Light[] = []
let lightDB = new DataStore<LightConfig>('lights.db')

const SYNCHROTRON_PORT = 2077
let udpSocket = createSocket('udp4')
udpSocket.on('message', (msg, rinfo) => {
    let light = lights.find(l => l.name == msg.toString())
    if (light) {
        light.ip = rinfo.address
        console.log(`[UDP SOCKET] client ${light.name} connected with ip ${light.ip}`)
    }
})
udpSocket.bind(SYNCHROTRON_PORT)

export async function configureLights() {
    let lightConfs = config.get<{ name: string, strips: number[] }[]>("Lights")
    for (const conf of lightConfs) {
        let doc = await lightDB.findOne({ name: conf.name })
        if (!doc) doc = await lightDB.insert({ name: conf.name, strips: conf.strips, layers: [] })
        lights.push(new Light(doc))
    }
    for (const light of lights) {
        light.on('newLayer', async () => {
            await lightDB.update({ name: light.name }, {
                $set: {
                    layers: light.layers.map(layer => layer.toObject())
                }
            })
        })
        light.on('advance', () => {
            if (light.ip) udpSocket.send(light.toBuffer(), SYNCHROTRON_PORT, light.ip)
        })
    }
    return lights
}