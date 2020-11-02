import React from 'react'
import LayerOptionSelector from './LayerOptionSelector'

import ColorOption, { Color } from '../options/Color'

export default class StaticOptions extends LayerOptionSelector<{ color: Color }> {
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