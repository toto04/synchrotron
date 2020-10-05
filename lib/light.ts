import { LightConfig, StripSet } from './util'

export class Light {
    pixels: StripSet
    constructor(config: LightConfig) {
        this.pixels = []
    }
}