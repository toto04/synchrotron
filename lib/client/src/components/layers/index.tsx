import React from 'react'
import { LayerConfig } from '../../util'
import { StaticOptions, StaticOptionsProps } from './Static'

type LayersArray = {
    [key: string]: {
        description: string
        // defaultOptions: any
        createDefaultConfig: () => LayerConfig
        createOptionContainer: (defaultOptions: any, onChange: (v: any) => void) => JSX.Element
    }
}

export let layerTypes: LayersArray = {
    static: {
        description: "uniform static color, supports transparency",
        createDefaultConfig: () => {
            let options: StaticOptionsProps = { color: { r: 255, g: 255, b: 255, a: 1 } }
            return {
                type: 'static',
                options,
                pixelIndexes: []
            }
        },
        createOptionContainer: (defaultOptions: StaticOptionsProps, onChange: (v: StaticOptionsProps) => void) =>
            <StaticOptions defaultOptions={defaultOptions} onChange={onChange} />
    }
}

export default function getOptionContainer(type: string, defaultOptions: any, onChange: (v: any) => void): JSX.Element {
    switch (type) {
        case 'static':
            return <StaticOptions defaultOptions={defaultOptions} onChange={onChange} />
        default:
            return <div className="optionContainer" />
    }
}
