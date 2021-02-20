import React from 'react'
import { LayerConfig } from 'types'
import { StaticOptions, StaticOptionsProps } from './Static'
import { LinearGradientOptions, LinearGradientOptionsProps } from './LinearGradient'

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
    },
    'linear gradient': {
        description: "a linear gradient between two colors",
        createDefaultConfig: () => {
            let options: LinearGradientOptionsProps = {
                colors: [{ color: { r: 255, g: 255, b: 255, a: 1 }, point: 0 }],
                speed: 0
            }
            return {
                type: 'linear gradient',
                options,
                pixelIndexes: []
            }
        },
        createOptionContainer: (defaultOptions: LinearGradientOptionsProps, onChange: (v: LinearGradientOptionsProps) => void) =>
            <LinearGradientOptions defaultOptions={defaultOptions} onChange={onChange} />
    }
}
