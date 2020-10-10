import { Layer, LightConfig, Pixel, StripSet } from './util'
import { StaticColorLayer } from './functions'
import { EventEmitter } from 'events';

export declare interface Light {
    on(event: 'advance', listener: () => void): this
}

export class Light extends EventEmitter {
    time: number = 0;
    interval?: NodeJS.Timeout
    name: string
    layers: Layer[] = []
    pixels: StripSet = []
    constructor(config: LightConfig) {
        super()
        this.name = config.name

        for (const stripLength of config.strips) {
            // initializes a strip set of given dimensions with all off pixels
            let strip: Pixel[] = []
            for (let i = 0; i < stripLength; i++) strip.push(Pixel.off())
            this.pixels.push(strip)
        }

        for (let layerConfig of config.layers) {
            switch (layerConfig.type) {
                case 'static':
                    this.layers.push(new StaticColorLayer(layerConfig.options.color, layerConfig.pixelIndexes, this.pixels))
                    break
                default:
                    // if this happens ima kms
                    this.layers.push(new Layer(layerConfig, this.pixels))
            }
        }
    }

    toBuffer() {
        let bufs: Buffer[] = []
        for (const strip of this.pixels) bufs.push(Buffer.concat(strip.map(p => p.toBuffer())))
        return Buffer.concat(bufs)
    }

    advance = () => {
        for (let layer of this.layers) {
            layer.compute(this.time)
        }
        this.time++
        this.emit('advance')
    }

    start = (frequency: number) => {
        let gap = 1000 / frequency
        this.interval = setInterval(() => this.advance(), gap)
    }
    stop = () => this.interval ?? clearInterval(this.interval)
}