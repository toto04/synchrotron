import { Layer, sRGBCompanding, inversesRGBCompanding, linearInterpolation, linearColorInterpolation } from '../util'
import { PixelIndex, StripSet, ColorArray, ColorPoint } from 'types'

export class LinearGradientLayer extends Layer {
    constructor(colors: ColorArray, speed: number, pixels: PixelIndex[], stripSet: StripSet) {
        super({
            type: 'linear gradient',
            options: { colors, speed },
            pixelIndexes: pixels
        }, stripSet)

        let indexes: PixelIndex[][] = []
        stripSet.forEach((strip, i) => {
            indexes.push(pixels.filter(p => p[0] == i).sort((a, b) => a[1] - b[1]))
        })

        this.shine = (instant, prevPixel, index) => {
            let strip = indexes[index[0]]
            let max = strip[strip.length - 1][1]

            let totalMix = max ? index[1] / max : 1
            if (speed) {
                let fullcycleSteps = 2000 / speed 
                totalMix += (instant % fullcycleSteps) / fullcycleSteps
                if (totalMix > 1) totalMix -= 1
                if (totalMix < 0) totalMix += 1
            }

            let startColor: ColorPoint | undefined = colors[0]
            let endColor: ColorPoint | undefined = colors[0]

            for (const colorPoint of colors) {
                startColor = endColor
                endColor = colorPoint
                if (endColor.point > totalMix) break
            }
            if (!startColor) return prevPixel

            // console.log({ startColor, endColor })

            let mix = (totalMix - startColor.point) / (endColor.point - startColor.point)
            mix = Math.max(mix, 0)
            mix = Math.min(mix, 1)
            // console.log(mix)

            let start = inversesRGBCompanding(startColor.color)
            let end = inversesRGBCompanding(endColor.color)

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