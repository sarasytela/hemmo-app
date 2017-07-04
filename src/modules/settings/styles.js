import {
  StyleSheet,
  Platform,
} from 'react-native';
import { getSizeByWidth } from '../../services/graphics';

const iconSize = getSizeByWidth('nelio', 0.22).width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
  },
  titleBar: {
    flexDirection: 'row',
  },
  titleBarSection: {
    flex: 1,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 15,
  },
  font: {
    fontFamily: 'Gill Sans',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    width: null,
    margin: 10,
    fontSize: 15,
  },
  form: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 5,
    flexDirection: 'column',
  },
  rightColumn: {
    flex: 3,
    flexDirection: 'column',
  },
  inputField: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    flex: 2,
    fontSize: 20,
  },
  textInputView: {
    alignItems: 'center',
    flex: 4,
  },
  input: {
    textAlign: 'center',
    alignSelf: 'stretch',
    fontSize: 20,
    ...Platform.select({
      ios: {
        height: 40,
        fontSize: 20,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: 'rgba(65,65,65,1)',
        backgroundColor: 'rgba(209, 209, 209, 0.29)',
      },
      android: {
        fontSize: 20,
      },
    }),
  },
  imagefield: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    flex: 1,
    margin: 10,
    width: iconSize,
    height: iconSize,
  },
  buttonfield: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    marginTop: 50,
  },
  removeButton: {
    borderRadius: 10,
    width: 100,
  },
  backButton: {
    marginRight: 10,
  },
});

module.exports = styles;
