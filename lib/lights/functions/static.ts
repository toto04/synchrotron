import { Color, Layer, PixelIndex, StripSet } from '../util'

export class StaticColorLayer extends Layer {
    constructor(color: Color, pixels: PixelIndex[], stripSet: StripSet) {
        super({
            type: 'static',
            options: { color },
            pixelIndexes: pixels
        }, stripSet)
        this.shine = (_instant, prevPixel) => prevPixel.add(color)
    }
}