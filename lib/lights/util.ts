export interface RGB {
    r: number
    g: number
    b: number
}

export class Pixel implements RGB {
    static off = () => {
        return new Pixel(0, 0, 0)
    }
    static clone = (pixel: Pixel) => {
        return new Pixel(pixel.r, pixel.g, pixel.b)
    }

    r: number
    g: number
    b: number
    constructor(r: number, g: number, b: number) {
        this.r = r
        this.g = g
        this.b = b
    }
    add(color: Color) {
        let alpha = color.a / 255
        this.r = Math.round(this.r * (1 - alpha) + color.r * alpha)
        this.g = Math.round(this.g * (1 - alpha) + color.g * alpha)
        this.b = Math.round(this.b * (1 - alpha) + color.b * alpha)
        return this
    }

    toBuffer() {
        return Buffer.from([this.r, this.g, this.b])
    }
}

export type Color = RGB & {
    a: number
}

export type PixelIndex = [number, number]
export type Strip = Pixel[]
export type StripSet = Strip[]

export interface LayerConfig {
    type: string,
    options: any,
    pixelIndexes: PixelIndex[]
}

export interface LightConfig {
    name: string
    strips: number[]
    layers: LayerConfig[]
}

/**
 * A shine function generates the next state of a pixel
 */
export type shineFunction = (instant: number, prevPixel: Pixel, index: PixelIndex, pixels: StripSet) => Pixel

export class Layer {
    type: string
    options: any
    pixelIndexes: PixelIndex[]
    stripSet: StripSet
    static types: { [key: string]: string } = {}
    constructor(config: LayerConfig, stripSet: StripSet) {
        this.type = config.type
        this.options = config.options
        this.pixelIndexes = config.pixelIndexes
        this.stripSet = stripSet
    }

    compute = (instant: number) => {
        for (const pixelIndex of this.pixelIndexes) {
            const pixel = this.stripSet[pixelIndex[0]][pixelIndex[1]]
            this.stripSet[pixelIndex[0]][pixelIndex[1]] = this.shine(instant, Pixel.clone(pixel), pixelIndex, this.stripSet)
        }
    }

    toObject: () => LayerConfig = () => ({
        type: this.type,
        options: this.options,
        pixelIndexes: this.pixelIndexes
    })

    shine: shineFunction = () => Pixel.off()
}