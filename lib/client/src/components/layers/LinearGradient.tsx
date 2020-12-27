import React from 'react'
import LayerOptionSelector from './LayerOptionSelector'

import ColorOption, { Color } from '../options/Color'
import ColorPoint from '../options/ColorPoint'

export interface LinearGradientOptionsProps {
    startColor: Color,
    endColor: Color
}
export class LinearGradientOptions extends LayerOptionSelector<LinearGradientOptionsProps> {
    render = () => {
        return <div className="optionContainer">
            <ColorOption
                name="start color:"
                defaultValue={this.props.defaultOptions.startColor}
                onChange={startColor => this.setState({ startColor }, () => this.onChange())}
            />
            <ColorOption
                name="end color:"
                defaultValue={this.props.defaultOptions.endColor}
                onChange={endColor => this.setState({ endColor }, () => this.onChange())}
            />
        </div>
    }
}