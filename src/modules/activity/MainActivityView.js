import React, {PropTypes} from 'react';
import {List} from 'immutable';
import * as ActivityState from '../../modules/activity/ActivityState';
import SubActivityView from './SubActivityView';
import {
  Image,
  TouchableHighlight,
  View
} from 'react-native';

var styles = require('./styles.js');
var activities = require('./activities.js');

const MainActivityView = React.createClass({

  propTypes: {
    dispatch: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    showSubActivities: PropTypes.bool.isRequired,
    subActivities: PropTypes.instanceOf(List)
  },
  openModal(key) {
    this.props.dispatch(ActivityState.openSubActivities(key));
  },
  render() {

    const activityViews = activities.map((activity) => (

      <View key={activity.key} style={styles.activity}>
        <TouchableHighlight
          style={styles.highlight}
          onPress={this.openModal.bind(this, activity.subActivities)}>
            <Image
              resizeMode={'contain'}
              style={styles.activityImage}
              source={activity.route}/>
        </TouchableHighlight>
      </View>
    ));

    if (this.props.showSubActivities === true)
    {
      var subActivities =
        <SubActivityView subActivities={this.props.subActivities} dispatch={this.props.dispatch}/>;
    }
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {activityViews[0]}
          {activityViews[1]}
          {activityViews[2]}
        </View>

        <View style={styles.row}>
          {activityViews[3]}
          <View style={styles.hemmo}>
            <Image resizeMode={'contain'}
              style={styles.hemmoImage}
              source={require('../../../assets/Hemmo.jpg')}/>
          </View>
          {activityViews[4]}
        </View>

        {subActivities}

      </View>
    );
  }
});

export default MainActivityView;