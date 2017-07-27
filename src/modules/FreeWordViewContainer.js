import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { NavigationActions } from 'react-navigation';
import {
  TouchableOpacity,
  Image,
  Text,
  Alert,
  View,
  StyleSheet,
} from 'react-native';
import AudioRecorder from '../components/AudioRecorder';
import LoadingSpinner from '../components/LoadingSpinner';
import SaveConfirmationWindow from '../components/SaveConfirmationWindow';
import TextForm from '../components/TextForm';
import { addFreeWord } from '../state/UserState';
import { setText, setAudio } from '../state/HemmoState';
import { getSizeByHeight, getImage } from '../services/graphics';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioRecorder: {
    marginBottom: 70,
  },
});

const phrases = require('../data/phrases.json');

const mapStateToProps = state => ({
  answers: state.getIn(['user', 'currentUser', 'answers']),
});

const mapDispatchToProps = dispatch => ({
  back: () => dispatch(NavigationActions.back()),
  pushRoute: key => dispatch(NavigationActions.navigate({ routeName: key })),
  popRoute: () => dispatch(NavigationActions.back()),
  saveFreeWord: freeWord => dispatch(addFreeWord(freeWord)),
  setText: text => dispatch(setText(text)),
  setAudio: audio => dispatch(setAudio(audio)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class FreeWordViewContainer extends Component {
  static navigationOptions = {
    title: 'Kerro vapaasti',
    tabBarIcon: (
      <Image
        source={require('./icon_tellfreely.png')}
        style={{ width: 64, height: 64 }}
      />
    ),
  };

  static propTypes = {
    popRoute: PropTypes.func.isRequired,
    pushRoute: PropTypes.func.isRequired,
    setText: PropTypes.func.isRequired,
    setAudio: PropTypes.func.isRequired,
    saveFreeWord: PropTypes.func.isRequired,
    answers: PropTypes.instanceOf(Map).isRequired,
  };

  state = {
    text: '',
    showTextForm: false,
    progress: 0,
    showMessage: false,
    disableWriting: false,
    showSpinner: false,
  };

  componentWillMount() {
    this.props.setText(phrases.FreeWord.text);
    this.props.setAudio(phrases.FreeWord.audio);
  }

  setText = text => {
    this.setState({ text });
  };

  closeConfirmationMessage = () => {
    this.setState({ showMessage: false });
  };

  showConfirmationMessage = () => {
    this.setState({ showMessage: true });
  };

  error = () => {
    this.setState({ showSpinner: false });
    Alert.alert(
      'Ohops!',
      'Jokin meni pieleen! Tarkista nettiyhteys tai yritä myöhemmin uudelleen!',
      [{ text: 'Ok' }],
    );
  };

  save = async (type, content) => {
    this.setState({ showSpinner: true });

    this.props.saveFreeWord({ type, content });

    if (type === 'text') {
      this.toggleWriting();
    }

    this.setState({ showSpinner: false });
  };

  toggleWritingButton = value => {
    this.setState({ disableWriting: value });
  };

  toggleWriting = () => {
    this.setState({ text: '', showTextForm: !this.state.showTextForm });
  };

  renderTextForm = () =>
    this.state.showTextForm
      ? <TextForm
          toggleWriting={this.toggleWriting}
          save={this.save}
          setText={this.setText}
        />
      : null;

  renderSaveConfirmationWindow = () =>
    this.state.showMessage
      ? <SaveConfirmationWindow closeWindow={this.closeConfirmationMessage} />
      : null;

  renderAudioRecorder = () =>
    <View style={styles.audioRecorder}>
      <AudioRecorder
        save={this.save}
        toggleWritingButton={this.toggleWritingButton}
      />
    </View>;

  renderWriteButton = () =>
    <TouchableOpacity
      disabled={this.state.disableWriting}
      onPress={this.toggleWriting}
      style={{ flexDirection: 'row', alignItems: 'center' }}
    >
      <Image
        source={require('./write.png')}
        style={{
          height: 150,
          width: 150,
          opacity: this.state.disableWriting ? 0.4 : 1,
          //backgroundColor: this.state.disableWriting ? 'gray' : 'white',
        }}
      />
      <Text style={{ textAlign: 'center', fontSize: 30, padding: 20 }}>
        Kirjoita
      </Text>
    </TouchableOpacity>;

  render() {
    if (this.state.showSpinner) {
      return <LoadingSpinner />;
    }

    return (
      <View style={styles.container}>
        {this.renderAudioRecorder()}
        {this.renderWriteButton()}
        {this.renderTextForm()}
        {/*{this.renderSaveConfirmationWindow()}*/}
        <TouchableOpacity onPress={this.props.back} style={{ paddingTop: 20 }}>
          <Image
            source={require('./done.png')}
            style={{ width: 120, height: 60 }}
          />
        </TouchableOpacity>
      </View>
    );
  }
}
