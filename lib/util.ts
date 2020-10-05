export interface LightConfig {
    name: string
    strips: number[]
}

export interface RGB {
    r: number
    g: number
    b: number
}

export class Pixel implements RGB {
    r = 0
    g = 0
    b = 0
    add(color: Color) {
        let alpha = color.a / 255
        this.r = Math.round(this.r * (1 - alpha) + color.r * alpha)
        this.g = Math.round(this.g * (1 - alpha) + color.g * alpha)
        this.b = Math.round(this.b * (1 - alpha) + color.b * alpha)
    }
}

export type Color = RGB & {
    a: number
}

export type PixelIndex = [number, number]
export type Strip = Pixel[]
export type StripSet = Strip[]

/**
 * A shine function generates the next state of a pixel
 */
export type shineFunction = (instant: number, index: PixelIndex, pixels: StripSet) => void

export class Layer {
    type: string
    options: any
    pixels: Pixel[]
    shine: shineFunction
    static types: { [key: string]: string } = {}
    constructor(type: string, options: any, pixels: Pixel[]) {
        this.type = type
        this.options = options
        this.pixels = pixels
        this.shine = () => { }
    }
}