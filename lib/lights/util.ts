import { RGB, Color, RGBLinear, PixelIndex, StripSet, LayerConfig } from 'types'

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

    off() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
    }

    add(color: Color) {
        let alpha = color.a
        this.r = Math.round(this.r * (1 - alpha) + color.r * alpha)
        this.g = Math.round(this.g * (1 - alpha) + color.g * alpha)
        this.b = Math.round(this.b * (1 - alpha) + color.b * alpha)
        return this
    }

    toBuffer() {
        return Buffer.from([this.r, this.g, this.b])
    }
}

export let sRGBCompanding = (linearColor: RGBLinear): Color => {
    let res: Color = Object.assign({}, linearColor)

    res.r = res.r <= 0.0031308 ? res.r * 12.92 : ((res.r ** (1 / 2.4)) * 1.055) - 0.055
    res.g = res.g <= 0.0031308 ? res.g * 12.92 : ((res.g ** (1 / 2.4)) * 1.055) - 0.055
    res.b = res.b <= 0.0031308 ? res.b * 12.92 : ((res.b ** (1 / 2.4)) * 1.055) - 0.055

    res.r = Math.round(255 * res.r)
    res.g = Math.round(255 * res.g)
    res.b = Math.round(255 * res.b)

    return res
}

export let inversesRGBCompanding = (color: Color): RGBLinear => {
    let res: RGBLinear = Object.assign({}, color)

    res.r /= 255
    res.g /= 255
    res.b /= 255

    res.r = res.r <= 0.04045 ? res.r / 12.92 : ((res.r + 0.055) / 1.055) ** 2.4
    res.g = res.g <= 0.04045 ? res.g / 12.92 : ((res.g + 0.055) / 1.055) ** 2.4
    res.b = res.b <= 0.04045 ? res.b / 12.92 : ((res.b + 0.055) / 1.055) ** 2.4

    return res
}

export let linearInterpolation = (v1: number, v2: number, mix: number) => {
    return v1 * (1 - mix) + v2 * mix
}

export let linearColorInterpolation = (color1: RGBLinear, color2: RGBLinear, mix: number): RGBLinear => {
    let res = Object.assign({}, color1)
    res.a = linearInterpolation(color1.a, color2.a, mix)
    res.r = linearInterpolation(color1.r, color2.r, mix)
    res.g = linearInterpolation(color1.g, color2.g, mix)
    res.b = linearInterpolation(color1.b, color2.b, mix)
    return res
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