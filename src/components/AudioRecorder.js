/*
View block that includes audio recording button and progression bar.
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import TimerMixin from 'react-timer-mixin';
import {
  Recorder,
} from 'react-native-audio-toolkit';
import { getSizeByHeight, getImage } from '../services/graphics';

const Permissions = require('react-native-permissions');

const styles = StyleSheet.create({
  recordRow: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
  },
  progressBar: {
    marginTop: 20,
  },
  highlightCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightSquare: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordPermissionButton: {
    borderRadius: 10,
    width: 100,
    backgroundColor: '#87cefa',
  },
});

const reactMixin = require('react-mixin');

const filename = 'test.mp4';

@reactMixin.decorate(TimerMixin)
export default class AudioRecorder extends Component {

  static propTypes = {
    save: PropTypes.func.isRequired,
    toggleWritingButton: PropTypes.func,
  };

  state = {
    recordButton: 'Record',
    recordButtonDisabled: true,
    progress: 0.01,
    filePath: null,
    recording: false,
    error: null,
  };

  componentWillUnmount() {
    if (this.recorder) {
      this.recorder.destroy();
    }

    if (this.player) {
      this.player.destroy();
    }

    clearInterval(this._progressInterval);
  }

  initializeRecorder = () => {
    this._reloadRecorder();

    this._progressInterval = setInterval(() => {
      if (this.recorder && this.recorder.isRecording) {
        if (this.state.progress >= 1) {
          this._toggleRecord();
        } else {
          this.setState({ progress: this.state.progress + 0.01 });
        }
      }
    }, 1200);
  };

  checkRecordPermission = async () => {
    try {
      return await Permissions.check('microphone');
    } catch (e) {
      console.log(e);
    }

    return 'undetermined';
  };

  requestRecordPermission = async () => {
    try {
      return await Permissions.request('microphone');
    } catch (e) {
      console.log(e);
    }

    return 'undetermined';
  };

  _updateState = () => {
    this.setState({
      recordButton: this.recorder && this.recorder.isRecording ? 'Stop' : 'Record',
      recording: !!(this.recorder && this.recorder.isRecording),
      recordButtonDisabled: !this.recorder,
    });

    this.props.toggleWritingButton(this.state.recording);
  };

  _reloadRecorder = () => {
    if (this.recorder) {
      this.recorder.destroy();
    }

    this.recorder = new Recorder(filename, {
      bitrate: 256000,
      channels: 2,
      sampleRate: 44100,
      quality: 'max',
      // format: 'ac3', // autodetected
      // encoder: 'aac', // autodetected
    }).prepare((err, filePath) => {
      if (err) {
        console.error(err);
      }

      this.setState({ filePath });
    });

    this._updateState();
  };

  _toggleRecord = () => {
    this.recorder.toggleRecord((err, stopped) => {
      if (err) {
        this.setState({
          error: err.message,
        });
        this._updateState();
      }
      if (stopped) {
        this._updateState();
        this.setState({ progress: 0 });
        this.recorder.destroy();
        this.props.save('audio', this.state.filePath);
      } else {
        this._updateState();
      }
    });
  };

  showRequestAlert = async () => {
    const permission = await this.requestRecordPermission();

    if (permission === 'authorized') {
      this.initializeRecorder();
      this._toggleRecord();
    }
  };

  handleStartRecordClick = async () => {
    const permission = await this.checkRecordPermission();

    if (permission !== 'authorized') {
      return Alert.alert(
        'Saammeko käyttää laitteesi mikrofonia?',
        'Tarvitsemme oikeuden mikrofoniin, jotta äänen nauhoittaminen onnistuu.',
        [
          { text: 'Estä', onPress: () => console.log('permission denied'), style: 'cancel' },
          permission === 'undetermined' || Platform.OS === 'android' ?
            { text: 'Salli', onPress: this.showRequestAlert }
            : { text: 'Avaa asetukset', onPress: Permissions.openSettings },
        ],
      );
    }

    this.initializeRecorder();
    this._toggleRecord();
  };

  renderStartRecordButton = () => (
    <TouchableOpacity
      onPress={this.handleStartRecordClick}
      style={{flexDirection: 'row', alignItems: 'center'}}
    >
      <Image source={getImage('nappula_rec')} style={getSizeByHeight('nappula_rec', 0.35)} />
      <Text style={{textAlign: 'center', fontSize: 30, padding: 20}}>Nauhoita</Text>
    </TouchableOpacity>
    );

  renderStopRecordButton = () => (
    <TouchableOpacity
      onPress={this._toggleRecord}
      style={{flexDirection: 'row', alignItems: 'center'}}
    >
      <Image source={getImage('nappula_stop')} style={getSizeByHeight('nappula_stop', 0.35)} />
      <Text style={{textAlign: 'center', fontSize: 30, padding: 20}}>Pysäytä</Text>
    </TouchableOpacity>
    );

  renderRecordButton = () => {
    if (this.state.recordButton === 'Record') {
      return this.renderStartRecordButton();
    } else if (this.state.recordButton === 'Stop') {
      return this.renderStopRecordButton();
    }

    return null;
  };

  render() {
    return (
      <View style={styles.recordRow}>
        {this.renderRecordButton()}
        <View style={styles.progressBar}>
          <ProgressBar progress={this.state.progress} height={50} width={200} />
        </View>
      </View>
    );
  }
}
