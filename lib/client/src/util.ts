export function buf2hex(buffer: ArrayBuffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

export interface LightState {
    name: string
    switchedOn: boolean
    selectedProfileIndex: number
    profiles: string[]
    pixels: number[]
}

export type PixelIndex = [number, number]

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