import * as NavigationState from '../../modules/navigation/NavigationState';
import * as UserState from '../../modules/user/UserState';
import React, {PropTypes} from 'react';
import {List, Map} from 'immutable';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from '../../components/Button';
import SaveConfirmationWindow from '../../components/SaveConfirmationWindow';
import {post} from '../../utils/api';
import {getSize, getImage} from '../../services/graphics';

import {
  NativeModules,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
  TextInput,
  View
} from 'react-native';

var styles = require('./styles.js');
var options = require('./image-picker-options');
var ImagePicker = NativeModules.ImagePickerManager;
var removeButton;
var texts;

const SettingsView = React.createClass({

  propTypes: {
    dispatch: PropTypes.func.isRequired,
    users: PropTypes.instanceOf(List),
    currentUser: PropTypes.instanceOf(Map)
  },

  getInitialState() {
    return {
      disabled: true,
      showSucceedingMessage: false
    };
  },

  getUserNames() {
    texts = this.props.users.map((user) => user.get('name'));
    if (this.props.users.size < 6) {
      texts = texts.concat(['+ Lisää lapsi']);
    }
    return texts;
  },

  saveUser() {
    if (this.props.currentUser.get('name') === '' ||
        this.props.currentUser.get('image') === null) {
      Alert.alert('Puuttuvia tietoja', 'Varmistathan, että kaikki kohdat on täytetty ennen jatkamista.');
    }
    else {
      var newId = this.props.users.size;
      if (this.props.currentUser.get('id') === null) {
        var name = this.props.currentUser.get('name');

        post('/register', {name})
          .then(
            result => this.props.dispatch(UserState.setCurrentUserValue('token', 'Bearer ' + result.token))
              .then(() => {
                this.props.dispatch(UserState.setCurrentUserValue('id', newId));
                this.props.dispatch(UserState.createUser(this.props.currentUser));
                this.setState({disabled: true});
                this.showSucceedingMessage();
              }))
          .catch((error) => {
            Alert.alert('Virhe käyttäjän luonnissa!', 'Yritä myöhemmin uudelleen.' + error);
          });
      }
      else {
        this.props.dispatch(UserState.editUser(this.props.currentUser));
        this.setState({disabled: true});
      }
    }
  },

  cancel() {
    this.props.dispatch(NavigationState.popRoute());
  },

  showSucceedingMessage() {
    this.setState({showSucceedingMessage: true});
  },

  closeSucceedingMessage() {
    this.setState({showSucceedingMessage: false});
  },

  verifyRemove() {
    Alert.alert(
      'Oletko varma?',
      'Haluatko varmasti poistaa käyttäjän ' + this.props.currentUser.get('name') + '?',
      [{
        text: 'Kyllä',
        onPress: this.remove
      },{
        text: 'Peruuta'}
      ]
    );
  },

  remove() {
    this.props.dispatch(UserState.removeUser(this.props.currentUser.get('id')));
    this.props.dispatch(UserState.resetCurrentUser());
  },

  getChangedName(e) {
    if (this.state.disabled === true) {
      this.setState({disabled: false});
    }
    this.props.dispatch(UserState.setCurrentUserValue('name', e.nativeEvent.text));
  },

  // TODO: Display default-image after opening.
  openImageGallery() {
    ImagePicker.showImagePicker(options, (response) => {

      if (response.didCancel) {
        return;
      }
      else if (response.customButton) {
        this.props.dispatch(UserState.setCurrentUserValue('image', null));
      }
      else {
        const source = {uri: response.uri, isStatic: true};
        this.setState({disabled: false});

        this.props.dispatch(UserState.setCurrentUserValue('image', source.uri));
      }
    });
  },

  handleTabClick(user, index) {
    if (user === '+ Lisää lapsi') {
      this.addNewChildTab();
    }
    else {
      this.viewUserProfile(index);
    }
  },

  addNewChildTab() {
    this.props.dispatch(UserState.resetCurrentUser());
  },

  viewUserProfile(index) {
    this.props.dispatch(UserState.setCurrentUser(index));
  },

  render() {

    if (this.props.currentUser.get('id') !== null) {
      removeButton = (<Button
        style={styles.removebutton} highlightStyle={styles.buttonHighlight}
        onPress={this.verifyRemove} text={'Poista'} icon={''}/>);
    }
    else {
      removeButton = null;
    }

    var tabTexts = this.getUserNames();
    var tabs = tabTexts.map((user, index) => {
      /* Bold the text of selected tab */
      if (index === this.props.currentUser.get('id') ||
        (this.props.currentUser.get('id') === null && index === tabTexts.size - 1)) {
        var fontWeight = 'bold';
      }
      return (
        <TouchableOpacity key={index} onPress={this.handleTabClick.bind(this, user, index)}>
          <Image
            source={getImage('valilehti_tyhja')}
            onPress={this.handleTabClick.bind(this, user, index)}
            style={[styles.tab, getSize('valilehti_tyhja', 0.12)]}>
            <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.tabText, styles.font, {fontWeight}]}>
              {user}
            </Text>
          </Image>
        </TouchableOpacity>
      );
    });

    if (this.state.showSucceedingMessage === true) {
      var saveWasSuccesful = (
        <SaveConfirmationWindow closeWindow={this.closeSucceedingMessage}/>
      );
    }

    return (
      <Image source={getImage('tausta_perus')} style={styles.container}>
        <View style={styles.titleBar}>

          <TouchableOpacity onPress={this.cancel} style={styles.titleBarSection}>
            <Image
              source={getImage('nappula_takaisin')}
              onPress={this.cancel} style={[styles.backButton, getSize('nappula_takaisin', 0.1)]}/>
          </TouchableOpacity>

          <View style={styles.titleBarSection}>
            <Image source={getImage('ratas')} style={getSize('ratas', 0.08)}/>
            <Image source={getImage('asetukset')} style={getSize('asetukset', 0.05)}/>
          </View>
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.tabBar}>
          {tabs}
        </ScrollView>

        <Image source={getImage('tausta_asetukset')} style={[styles.form, getSize('tausta_asetukset', 0.66)]}>
          <View style={styles.leftColumn}>
            <View style={styles.inputField}>
              <Text style={[styles.label, styles.font]}>
                Nimi
              </Text>

              <View style={styles.textInputView}>
                <TextInput
                  style={styles.input}
                  ref = 'name'
                  onChange = {this.getChangedName}
                  value={this.props.currentUser.get('name')}/>
              </View>
            </View>

            <View style={styles.imagefield}>
              <Image source={getImage('nelio')} style={getSize('nelio', 0.35)}>
               <Image
                 style={styles.icon}
                 source={{uri: this.props.currentUser.get('image')}}/>
              </Image>

              <TouchableOpacity onPress={this.openImageGallery}>
                <Image
                  source={getImage('nappula_uusikuva')}
                  style={[{marginLeft: 20}, getSize('nappula_uusikuva', 0.12)]}/>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rightColumn}>
              <View style={styles.buttonfield}>

                <TouchableOpacity
                  disabled={this.state.disabled}
                  onPress={this.saveUser}>
                  <Image
                    source={getImage('nappula_tallenna')}
                    style={[getSize('nappula_tallenna', 0.1), {opacity: this.state.disabled ? 0.2 : 1}]}/>
                </TouchableOpacity>

                <View style={styles.bottomRow}>
                  <Button
                    style={styles.cancelbutton} highlightStyle={styles.buttonHighlight}
                    onPress={this.cancel} text={'Peruuta'} icon={''}/>
                  {removeButton}
                </View>

              </View>
          </View>
        </Image>
        {saveWasSuccesful}
      </Image>
    );
  }
});

export default SettingsView;
