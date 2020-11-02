import React from 'react'
import StaticOptions from './Static'

export { StaticOptions }
export default function getOptionContainer(type: string, defaultOptions: any, onChange: (v: any) => void): JSX.Element {
    switch (type) {
        case 'static':
            return <StaticOptions defaultOptions={defaultOptions} onChange={onChange} />
        default:
            return <div className="optionContainer" />
    }
}
