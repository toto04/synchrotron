import React from 'react'
import { SketchPicker } from 'react-color'
import Option from './Option'

export interface Color {
    r: number
    g: number
    b: number
    a: number
}

interface ColorOptionState {
    color: Color
}

function hex(c: Color) {
    return '#'
        + c.r.toString(16).padStart(2, '0')
        + c.g.toString(16).padStart(2, '0')
        + c.b.toString(16).padStart(2, '0')
        + Math.round(c.a * 255).toString(16).padStart(2, '0')
}

export default class ColorOption extends Option<Color, ColorOptionState> {
    state = { color: this.props.defaultValue }
    render = () => {
        return <div>
            <span className="optionName">{this.props.name}</span>
            <div className="colorSelection">
                <span style={{ fontFamily: 'monospace', fontSize: '1.2em' }}>{hex(this.state.color).toUpperCase()}</span>
                <div style={{
                    width: 50,
                    height: 30,
                    backgroundColor: hex(this.state.color)
                }} />

            </div>
            <SketchPicker
                color={this.state.color}
                onChangeComplete={v => {
                    let { r, g, b, a } = v.rgb
                    let color = { r, g, b, a: a ?? 1 }
                    this.setState({ color })
                    this.props.onChange(color)
                }}
            />
        </div>
    }
}