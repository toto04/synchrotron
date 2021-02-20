import React from 'react'
import { ChromePicker } from 'react-color'
import Option, { OptionProps } from './Option'
import { Color } from 'types'

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
    componentDidUpdate = (prevProps: OptionProps<Color>) => {
        if (this.props.defaultValue !== prevProps.defaultValue) {
            this.setState({ color: this.props.defaultValue })
        }
    }
    render = () => {
        return <div>
            <span className="optionName">{this.props.name}</span>
            <div className="colorSelection">
                <span style={{ fontFamily: 'monospace', fontSize: '1.2em' }}>{hex(this.state.color).toUpperCase()}</span>
                <div style={{
                    backgroundImage: "linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                }}>
                    <div style={{
                        width: 50,
                        height: 30,
                        backgroundColor: hex(this.state.color)
                    }} />
                </div>
            </div>
            <ChromePicker
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