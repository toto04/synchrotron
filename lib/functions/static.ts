import { Color, Layer, Pixel } from 'lib/util'

export default class Static extends Layer {
    static types = { colore: "color" }
    constructor(color: Color, pixels: Pixel[]) {
        super('static', { color }, pixels)
        this.shine = () => {
            this.pixels.forEach(pixel => pixel.add(color))
        }
    }
}