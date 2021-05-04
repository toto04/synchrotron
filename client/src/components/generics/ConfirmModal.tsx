import React, { Component } from 'react'
import Modal from 'react-modal'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message?: string
    destructive?: boolean
    buttonText?: string
}

interface ConfirmModalState {
    disabled: boolean
}

export default class ConfirmModal extends Component<ConfirmModalProps, ConfirmModalState> {
    state = { disabled: false }
    render = () => {
        return <Modal
            isOpen={this.props.isOpen}
            style={{
                overlay: { backgroundColor: '#000C' }
            }}
            ariaHideApp={false}
            shouldFocusAfterRender={false}
            className="modal"
            onRequestClose={() => this.props.onClose()}
            shouldCloseOnEsc
            shouldCloseOnOverlayClick
        >
            <h2>{this.props.title}</h2>
            {this.props.message ? <p>{this.props.message}</p> : undefined}
            <button
                className={this.props.destructive ? "destructive" : "save"}
                disabled={this.state.disabled}
                onClick={() => {
                    this.setState({ disabled: true })
                    this.props.onConfirm()
                }}
            >{this.props.buttonText ?? "confirm"}</button>
        </Modal>
    }
}