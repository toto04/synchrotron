import { configureLights } from './lib/init'

configureLights().then((lights) => {
    lights[0].start()
})