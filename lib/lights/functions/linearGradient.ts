import { Color, Layer, PixelIndex, StripSet, sRGBCompanding, inversesRGBCompanding, linearInterpolation, linearColorInterpolation } from '../util'

export class LinearGradientLayer extends Layer {
    constructor(startColor: Color, endColor: Color, pixels: PixelIndex[], stripSet: StripSet) {
        super({
            type: 'linear gradient',
            options: { startColor, endColor },
            pixelIndexes: pixels
        }, stripSet)

        let indexes: PixelIndex[][] = []
        stripSet.forEach((strip, i) => {
            indexes.push(pixels.filter(p => p[0] == i).sort((a, b) => a[1] - b[1]))
        })

        this.shine = (_instant, prevPixel, index) => {
            let strip = indexes[index[0]]
            let max = strip[strip.length - 1][1]
            let mix = index[1] / max

            let start = inversesRGBCompanding(startColor)
            let end = inversesRGBCompanding(endColor)

            let linearColor = linearColorInterpolation(start, end, mix)

            let s = linearColor.r + linearColor.g + linearColor.b
            if (s != 0) {
                let bri = linearInterpolation((start.r + start.g + start.b) ** 0.43, (end.r + end.g + end.b) ** 0.43, mix)
                let f = (bri ** (1 / 0.43)) / s
                linearColor.r = linearColor.r * f
                linearColor.g = linearColor.g * f
                linearColor.b = linearColor.b * f
            }

            let color = sRGBCompanding(linearColor)
            return prevPixel.add(color)
        }
    }
}