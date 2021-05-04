import { Layer } from '../util'
import SimplexNoise from 'simplex-noise'
import { Color, PixelIndex, StripSet } from 'typedefs'

export class NoiseLayer extends Layer {
    constructor(color: Color, speed: number, width: number, depth: number, pixels: PixelIndex[], stripSet: StripSet) {
        super({
            type: 'noise',
            options: { color, speed, width, depth },
            pixelIndexes: pixels
        }, stripSet)

        let simplex: SimplexNoise[] = []
        for (const _strip of stripSet) simplex.push(new SimplexNoise())

        this.shine = (instant, prevPixel, index) => {
            const noise = simplex[index[0]].noise2D(instant * speed / 500, index[1] / (2 * width))
            let c = { ...color }
            c.a *= 1 - ((noise + 1) * depth) / 2
            return prevPixel.add(c)
        }
    }
}