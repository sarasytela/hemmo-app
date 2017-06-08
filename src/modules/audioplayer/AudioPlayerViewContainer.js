import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Platform} from 'react-native';
import {Player} from 'react-native-audio-toolkit';

const AudioPlayerViewContainer = React.createClass({

  propTypes: {
    audioTrack: PropTypes.string,
    onEnd: PropTypes.func.isRequired,
    isActive: PropTypes.bool
  },

  componentWillMount() {
    var audioTrack;

    if (Platform.OS === 'ios') {
      audioTrack = '/audio/' + this.props.audioTrack + '.wav';
    }
    else {
      audioTrack = this.props.audioTrack;
    }

    this.player = new Player(audioTrack).prepare();

    this.player.on('ended', () => {
      this.props.onEnd();
    });
  },

  componentWillUnmount() {
    this.player.destroy();
  },

  checkActivity() {
    if (this.props.isActive === true) {
      this.player.play();
    }
    else if (this.props.isActive === false) {
      this.player.destroy();
    }
  },

  render() {
    this.checkActivity();

    return null;
  }
});

export default connect(
  state => ({
    isActive: state.getIn(['session', 'isActive'])
  })
)(AudioPlayerViewContainer);
