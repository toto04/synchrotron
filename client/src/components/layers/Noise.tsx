import React from 'react'
import LayerOptionSelector from './LayerOptionSelector'
import { Color } from 'typedefs'
import SliderOption from '../options/Slider'
import ColorOption from '../options/Color'

export interface NoiseOptionsProps {
    color: Color,
    speed: number,
    width: number,
    depth: number,
}
export class NoiseOptions extends LayerOptionSelector<NoiseOptionsProps> {
    render = () => {
        return <div className="optionContainer">
            <ColorOption
                defaultValue={this.props.defaultOptions.color}
                name="Linear gradient:"
                onChange={color => {
                    this.setState({ color }, () => this.onChange())
                }}
            />
            <SliderOption
                defaultValue={this.props.defaultOptions.speed}
                name="speed:"
                min={0.1}
                max={10}
                step={0.1}
                onChange={v => {
                    this.setState({ speed: v }, () => this.onChange())
                }}
            />
            <SliderOption
                defaultValue={this.props.defaultOptions.width}
                name="width:"
                min={0.1}
                max={10}
                step={0.1}
                onChange={v => {
                    this.setState({ width: v }, () => this.onChange())
                }}
            />
            <SliderOption
                defaultValue={this.props.defaultOptions.depth}
                name="depth:"
                min={0}
                max={1}
                step={0.01}
                onChange={v => {
                    this.setState({ depth: v }, () => this.onChange())
                }}
            />
        </div>
    }
}