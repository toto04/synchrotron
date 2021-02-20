import React from 'react'
import LayerOptionSelector from './LayerOptionSelector'
import { ColorArray } from 'types'
import ColorArrayOption from '../options/ColorArray'
import SliderOption from '../options/Slider'

export interface LinearGradientOptionsProps {
    colors: ColorArray,
    speed: number
}
export class LinearGradientOptions extends LayerOptionSelector<LinearGradientOptionsProps> {
    render = () => {
        return <div className="optionContainer">
            <ColorArrayOption
                defaultValue={{ colors: this.props.defaultOptions.colors }}
                name="Linear gradient:"
                onChange={v => {
                    this.setState({ colors: v.colors }, () => this.onChange())
                }}
            />
            <SliderOption
                defaultValue={this.props.defaultOptions.speed}
                name="speed:"
                min={-10}
                max={+10}
                step={0.1}
                onChange={v => {
                    this.setState({ speed: v }, () => this.onChange())
                }}
            />
        </div>
    }
}