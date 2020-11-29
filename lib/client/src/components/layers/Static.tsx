import React from 'react'
import LayerOptionSelector from './LayerOptionSelector'

import ColorOption, { Color } from '../options/Color'

export interface StaticOptionsProps {
    color: Color
}
export class StaticOptions extends LayerOptionSelector<StaticOptionsProps> {
    render = () => {
        return <div className="optionContainer">
            <ColorOption
                name="Static color:"
                defaultValue={this.props.defaultOptions.color}
                onChange={color => this.setState({ color }, () => this.onChange())}
            />
        </div>
    }
}