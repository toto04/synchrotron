import path from 'path'
import fs from 'fs'
import YAML from 'yaml'
import { DataStore } from '../lib/DataStore'
import { Light } from './lights'
import { LightConfig, ProfileConfig } from 'typedefs'

const exampleConfig = { port: 2077, lights: { superFunLight: [38, 54] } }
const configPath = path.join(__dirname, '../config.yml')

export let config: {
    lights: {
        [name: string]: number[]
    }
    port: number
}

if (fs.existsSync(configPath)) {
    config = YAML.parse(fs.readFileSync(configPath).toString())
} else {
    config = exampleConfig
    fs.writeFile(configPath, YAML.stringify(exampleConfig), () => {
        console.log('[Synchrotron API] generated default config file!')
    })
}

export let lightDB = new DataStore<LightConfig>('../lights.db')
export let profileDB = new DataStore<ProfileConfig>('../profiles.db')

export async function configureLights() {
    // get configuration
    let lightConfs = config.lights
    let lights: Light[] = []
    for (const name in lightConfs) {
        // restore light setup from database (or create entry if missing)
        let doc = await lightDB.findOne({ name })
        if (!doc) doc = await lightDB.insert({ name, strips: lightConfs[name] })

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

        lights.push(light)
    }
    return lights
}