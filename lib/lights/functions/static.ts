import { Layer } from '../util'
import { Color, PixelIndex, StripSet } from 'types'

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