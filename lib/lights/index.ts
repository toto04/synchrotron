import { Layer, LightConfig, Pixel, StripSet, LayerConfig, ProfileConfig } from './util'
import { LinearGradientLayer, StaticColorLayer } from './functions'
import { EventEmitter } from 'events';
export * from './util'

export declare interface Light {
    on(event: 'advance', listener: (buffer: Buffer) => void): this
    // on(event: 'newLayer', listener: () => void): this
    on(event: 'layerChange', listener: (newConfigs: LayerConfig[]) => void): this
    on(event: 'profileChange', listener: (profileName: string) => void): this
}

export class Light extends EventEmitter {

    static getLayer = (config: LayerConfig, pixelReference: StripSet): Layer => {
        switch (config.type) {
            case 'static':
                return new StaticColorLayer(config.options.color, config.pixelIndexes, pixelReference)
            case 'linear gradient':
                return new LinearGradientLayer(config.options.startColor, config.options.endColor, config.pixelIndexes, pixelReference)
            default:
                // if this happens ima kms
                return new Layer(config, pixelReference)
        }
    }

    time: number = 0;
    interval?: NodeJS.Timeout
    name: string
    profile?: ProfileConfig
    switchedOn: boolean = true
    layers: Layer[] = []
    pixels: StripSet = []
    ip?: string
    constructor(config: LightConfig) {
        super()
        this.name = config.name

        for (const stripLength of config.strips) {
            // initializes a strip set of given dimensions with all off pixels
            let strip: Pixel[] = []
            for (let i = 0; i < stripLength; i++) strip.push(Pixel.off())
            this.pixels.push(strip)
        }
    }

    setProfile = (newProfile: ProfileConfig) => {
        this.profile = newProfile
        this.layers = []
        this.pushLayersInternal(...newProfile.layers)
        this.emit('profileChange', newProfile.name)
    }

    resetProfile = () => {
        this.profile = undefined
        this.layers = []
    }

    toBuffer() {
        if (!this.switchedOn) return Buffer.alloc(this.pixels.reduce((total, cur) => total + cur.length * 3, 0))
        let bufs: Buffer[] = []
        for (const strip of this.pixels) bufs.push(Buffer.concat(strip.map(p => p.toBuffer())))
        return Buffer.concat(bufs)
    }

    switch(state: boolean | 'on' | 'off') {
        let on = (state === true || state === 'on')
        this.switchedOn = on
        if (!on) this.emit('advance', this.toBuffer())
    }

    private advance = () => {
        for (let strip of this.pixels) for (let pixel of strip) pixel.off()
        for (let layer of this.layers) {
            layer.compute(this.time)
        }
        this.time++
        this.emit('advance', this.toBuffer())
    }

    start = (frequency: number = 100) => {
        let gap = Math.floor(1000 / frequency)
        this.interval = setInterval(() => {
            if (this.switchedOn) this.advance()
        }, gap)
    }
    stop = () => this.interval ?? clearInterval(this.interval)

    private pushLayersInternal = (...layerConfigs: LayerConfig[]) => {
        for (const layerConfig of layerConfigs) {
            this.layers.push(Light.getLayer(layerConfig, this.pixels))
        }
    }

    addLayer = (config: LayerConfig) => {
        this.pushLayersInternal(config)
        this.emit('layerChange', this.layers.map(l => l.toObject()))
    }

    modifyLayer = (index: number, config: LayerConfig) => {
        this.layers.splice(index, 1, Light.getLayer(config, this.pixels))
        let newConfigs = this.layers.map(l => l.toObject())
        this.profile!.layers = newConfigs
        this.emit('layerChange', newConfigs)
    }

    deleteLayer = (index: number) => {
        this.layers.splice(index, 1)
        this.emit('layerChange', this.layers.map(l => l.toObject()))
    }
}
