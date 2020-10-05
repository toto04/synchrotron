import config from 'config'
import { LightConfig } from 'lib/util'
import { Light } from 'lib/light'

if (require.main === module) {
    let lights = config.get<LightConfig[]>('Lights')
    console.log(lights)
}