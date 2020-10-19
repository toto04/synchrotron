import React, { Component } from 'react'
import socketio from 'socket.io-client'
import Switch from 'react-switch'

function buf2hex(buffer: ArrayBuffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

export interface LightState {
    name: string,
    switchedOn: boolean,
    pixels: number[]
}

interface LightControlState {
    switchedOn: boolean
}

export default class LightControl extends Component<LightState, LightControlState> {
    state: LightControlState = { switchedOn: false }
    pixels: HTMLDivElement[][] = []
    socket = socketio()
    componentDidMount = () => {
        this.setState({ switchedOn: this.props.switchedOn })
        this.socket.on(this.props.name, (data: ArrayBuffer) => {
            const values = buf2hex(data)
            for (let i = 0; i < this.props.pixels.length; i++) {
                const pixels = this.props.pixels[i]
                for (let j = 0; j < pixels; j++) if (this.pixels.length) {
                    let p = this.pixels[i][j]
                    if (p) p.style.backgroundColor = '#' + values.substr((i * (this.props.pixels[i - 1] ?? 0) + j) * 6, 6)
                }
            }
        })
    }

    private generatePixels = () => {
        let strips: JSX.Element[][] = []
        for (let i = 0; i < this.props.pixels.length; i++) {
            const pixels = this.props.pixels[i]
            let s: JSX.Element[] = []
            let r: HTMLDivElement[] = []
            for (let j = 0; j < pixels; j++) s.push(<div
                ref={e => { if (e) r.push(e) }}
                className="pixelPreview"
                key={`pixelprev${i}-${j}`}
            />)
            strips.push(s)
            this.pixels.push(r)
        }
        return strips
    }

    render = () => {
        return <div className="lightControl">
            <h1>{this.props.name}</h1>
            <Switch
                onChange={switchedOn => {
                    this.setState({ switchedOn })
                    console.log('Switching', switchedOn)
                    fetch(`/${this.props.name}/switch`, {
                        method: 'post',
                        headers: { 'Content-type': 'application/json' },
                        body: JSON.stringify({ on: switchedOn })
                    })
                }}
                checked={this.state.switchedOn}
                className="switch"
                height={100}
                width={200}
            />
            <div className="stripPreviewContainer">
                {this.generatePixels().map((s, i) => <div className="stripPreview" key={`stripprev${i}`} >
                    {s}
                </div>)}
            </div>
        </div>
    }
}