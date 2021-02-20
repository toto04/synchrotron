import config from 'config'
import { createSocket } from 'dgram'
import { DataStore } from './DataStore'
import { Light } from './lights'
import { LightConfig, ProfileConfig } from 'types'

export let lights: Light[] = []
export let lightDB = new DataStore<LightConfig>('lights.db')
export let profileDB = new DataStore<ProfileConfig>('profiles.db')

const SYNCHROTRON_PORT = config.get<{ [key: string]: number }>("ports").synchrotron
let udpSocket = createSocket('udp4')
udpSocket.on('message', (msg, rinfo) => {
    let light = lights.find(l => l.name == msg.toString())
    if (light) {
        light.ip = rinfo.address
        // console.log(`[UDP SOCKET] client ${light.name} connected with ip ${light.ip}`)
    }
})
udpSocket.bind(SYNCHROTRON_PORT)

export async function configureLights() {
    // get configuration
    let lightConfs = config.get<{ name: string, strips: number[] }[]>("Lights")
    for (const conf of lightConfs) {
        // restore light setup from database (or create entry if missing)
        let doc = await lightDB.findOne({ name: conf.name })
        if (!doc) doc = await lightDB.insert({ name: conf.name, strips: conf.strips })

        let light = new Light(doc)
        if (doc.profile) {
            let profile = await profileDB.findOne({ name: doc.profile })
            if (profile) light.setProfile(profile)
        }
        light.on('profileChange', profileName => {
            // when the profile is changed, the DB is updated
            lightDB.update({ name: light.name }, { $set: { profile: profileName } })
        })
        light.on('layerChange', layers => {
            profileDB.update({ name: light.profile?.name }, {
                $set: { layers }
            })
        })
        light.on('advance', buffer => {
            // on each frame rendered the buffer is sent to the light
            if (light.ip) udpSocket.send(buffer, SYNCHROTRON_PORT, light.ip)
        })
        lights.push(light)
    }
    return lights
}