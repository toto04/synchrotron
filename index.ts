import { configureLights } from './lib/init'
import config from 'config'
import { initializeApi } from './lib/api'

configureLights().then((lights) => {
    lights[0].start()
    initializeApi(config.get<{ [key: string]: number }>("ports").web)
})