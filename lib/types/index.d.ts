export interface RGB {
    r: number
    g: number
    b: number
}

export type Color = RGB & {
    a: number
}

export type RGBLinear = Color

export type PixelIndex = [number, number]
export type Strip = Pixel[]
export type StripSet = Strip[]

export interface LayerConfig {
    type: string,
    options: any,
    pixelIndexes: PixelIndex[]
}

export interface ProfileConfig {
    light: string
    name: string
    layers: LayerConfig[]
}

export interface LightConfig {
    name: string
    strips: number[]
    profile?: string
}

export interface ColorPoint {
    color: Color
    point: number
}

export type ColorArray = ColorPoint[]