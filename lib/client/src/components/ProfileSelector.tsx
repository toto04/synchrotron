import React, { Component } from 'react'
import Modal from 'react-modal'

interface ProfileSelectorProps {
    className?: string
    lightName: string
    profiles: string[]
    selectedProfileIndex: number
    onProfileSelected: (name: string, index: number) => void
}

interface ProfileSelectorState {
    // selectedIndex: number
    creatingNewProfile: boolean
    newProfileName: string
    createEnabled: boolean
}

export default class ProfileSelector extends Component<ProfileSelectorProps, ProfileSelectorState> {
    r?: HTMLSelectElement
    state = {
        // selectedIndex: this.props.selectedProfileIndex,
        creatingNewProfile: false,
        newProfileName: '',
        createEnabled: true
    }
    render = () => {
        return <select
            className={this.props.className}
            ref={r => {
                if (r) {
                    this.r = r
                    if (this.props.selectedProfileIndex < 0) r.selectedIndex = 0
                    else r.selectedIndex = this.props.selectedProfileIndex
                }
            }}

            onChange={e => {
                if (e.target !== e.currentTarget) return
                if (e.target.selectedIndex === e.target.length - 1) this.setState({ creatingNewProfile: true })
                else {
                    this.props.onProfileSelected(e.target.value, e.target.selectedIndex - (this.props.selectedProfileIndex < 0 ? 1 : 0))
                    if (this.r) this.r.selectedIndex = e.target.selectedIndex
                }
            }}
        >
            {this.props.selectedProfileIndex < 0 ? <option disabled>no profile selected</option> : undefined}
            {this.props.profiles.map((p, i) => <option key={`profileselector${i}`}>{p}</option>)}
            <option style={{
                // fontStyle: '',
                color: '#777'
            }}>-- new profile --</option>

            <Modal
                isOpen={this.state.creatingNewProfile}
                style={{
                    overlay: {
                        backgroundColor: '#000C'
                    }
                }}
                ariaHideApp={false}
                shouldFocusAfterRender={false}
                className="newLayerModal"
                onRequestClose={() => this.setState({ creatingNewProfile: false })}
                shouldCloseOnEsc
                shouldCloseOnOverlayClick
            >
                <h2>Create a new profile</h2>
                <input
                    type="text"
                    placeholder="profile name"
                    value={this.state.newProfileName}
                    onChange={v => this.setState({ newProfileName: v.target.value })}
                />
                <button
                    className="save"
                    disabled={!(this.state.newProfileName && this.state.createEnabled)}
                    onClick={async () => {
                        this.setState({ createEnabled: false })
                        await fetch(`/lights/${this.props.lightName}/profiles`, {
                            method: 'post',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify({ newProfileName: this.state.newProfileName })
                        })
                        window.location.href = window.location.origin + '/edit/' + this.props.lightName
                    }}
                >create</button>
            </Modal>

        </select>
    }
}