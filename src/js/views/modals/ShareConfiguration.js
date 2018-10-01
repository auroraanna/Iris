
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { createStore, bindActionCreators } from 'redux'

import Modal from './Modal';
import Icon from '../../components/Icon';

import * as uiActions from '../../services/ui/actions';
import * as pusherActions from '../../services/pusher/actions';
import * as helpers from '../../helpers';

class ShareConfiguration extends React.Component {

	constructor(props){
		super(props);

		this.state = {
			recipients: [],
			spotify: false,
			lastfm: false,
			genius: false,
			snapcast_client_commands: false,
			ui: false
		};
	}

	componentDidMount(){
		this.props.uiActions.setWindowTitle("Share configuration");
	}

	toggleRecipient(id){
		var recipients = this.state.recipients;
		if (recipients.includes(id)){
			var index = recipients.indexOf(id);
			recipients.splice(index,1);
		} else {
			recipients.push(id);
		}
		this.setState({recipients: recipients});
	}

	handleSubmit(e){
		e.preventDefault();

		var configuration = {};
		if (this.state.spotify){
			configuration.spotify = {
				authorization: this.props.spotify_authorization,
				me: this.props.spotify_me
			}
		}
		if (this.state.genius){
			configuration.genius = {
				authorization: this.props.genius_authorization,
				me: this.props.genius_me
			}
		}
		if (this.state.lastfm){
			configuration.lastfm = {
				authorization: this.props.lastfm_authorization,
				me: this.props.lastfm_me
			}
		}
		if (this.state.ui){
			configuration.ui = this.props.ui;
		}
		if (this.state.snapcast_client_commands){
			configuration.snapcast_client_commands = this.props.snapcast_client_commands;
		}

		for (var recipient of this.state.recipients){
			this.props.pusherActions.deliverMessage(
				recipient,
				'share_configuration_received',
				configuration
			);
		}

		//window.history.back();
		return;
	}

	render(){
		var connections = []
		for (var connection_id in this.props.connections){
			if (this.props.connections.hasOwnProperty(connection_id) && connection_id != this.props.connection_id){
				connections.push(this.props.connections[connection_id])
			}
		}

		if (connections.length > 0){
			var recipients = (
				<div className="input">
					{
						connections.map((connection, index) => {
							return (
								<label key={connection.connection_id}>
									<input 
										type="checkbox"
										name={"connection_"+connection.connection_id}
										checked={this.state.recipients.includes(connection.connection_id)}
										onChange={e => this.toggleRecipient(connection.connection_id)}
									/>
									<span className="label">
										{ connection.username }
										&nbsp;
										<span className="grey-text">
											({ connection.ip })
										</span>
									</span>
								</label>
							);
						})
					}
				</div>
			);
		} else {
			var recipients = (
				<div className="input text">
					<span className="grey-text">
						No peer connections
					</span>
				</div>
			);
		}

		return (
			<Modal className="modal--share-authorization">
				<h1>Share configuration</h1>
				<form onSubmit={e => this.handleSubmit(e)}>
					<div className="field checkbox white">
						<div className="name">Recipients</div>
						{recipients}
					</div>

					<div className="field checkbox checkbox--block">
						<div className="name">Configurations</div>
						<div className="input">
							<label>
								<input 
									type="checkbox"
									name="interface"
									checked={ this.state.ui }
									onChange={ e => this.setState({ ui: !this.state.ui })} />
								<span className="label">
									UI customisation (theme, sorting, filters)
								</span>
							</label>

							{this.props.snapcast_client_commands ? <label>
								<input 
									type="checkbox"
									name="snapcast_client_commands"
									checked={this.state.snapcast_client_commands}
									onChange={ e => this.setState({ snapcast_client_commands: !this.state.snapcast_client_commands })} />
								<span className="label">
									Snapcast client commands
								</span>
							</label> : null}

							{this.props.spotify_me && this.props.spotify_authorization ? <label>
								<input 
									type="checkbox"
									name="spotify"
									checked={this.state.spotify}
									onChange={ e => this.setState({ spotify: !this.state.spotify })} />
								<span className="label">
									Spotify authorization <span className="grey-text">&nbsp;Logged in as {this.props.spotify_me.name}</span>
								</span>
							</label> : null}

							{this.props.lastfm_me && this.props.lastfm_authorization ? <label>
								<input 
									type="checkbox"
									name="lastfm_authorization"
									checked={this.state.lastfm}
									onChange={ e => this.setState({ lastfm: !this.state.lastfm })} />
								<span className="label">
									LastFM authorization <span className="grey-text">&nbsp;Logged in as {this.props.lastfm_me.name}</span>
								</span>
							</label> : null}

							{this.props.genius_me && this.props.genius_authorization ? <label>
								<input 
									type="checkbox"
									name="genius_authorization"
									checked={this.state.genius}
									onChange={ e => this.setState({ genius: !this.state.genius })} />
								<span className="label">
									Genius authorization <span className="grey-text">&nbsp;Logged in as {this.props.genius_me.name}</span>
								</span>
							</label> : null}
						</div>
					</div>

					<div className="actions centered-text">
						{this.state.recipients.length > 0 ? <button className="primary large" onClick={e => this.handleSubmit(e)}>Send</button> : <button className="primary large" disabled="disabled" onClick={e => this.handleSubmit(e)}>Send</button>}
					</div>
				</form>
			</Modal>
		)
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		spotify_authorization: state.spotify.authorization,
		spotify_me: state.spotify.me,
		genius_authorization: state.genius.authorization,
		genius_me: state.genius.me,
		lastfm_authorization: state.lastfm.authorization,
		lastfm_me: state.lastfm.me,
		snapcast_client_commands: state.snapcast.client_commands,
		ui: state.ui,
		connection_id: state.pusher.connection_id,
		connections: state.pusher.connections
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		pusherActions: bindActionCreators(pusherActions, dispatch),
		uiActions: bindActionCreators(uiActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ShareConfiguration)