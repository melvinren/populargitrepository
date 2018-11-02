import React from 'react';
import { StyleSheet, View, ActivityIndicator, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window')

export default class App extends React.Component {

  render() {
    return (
      <View style={[styles.container, {width, height}]} key={`loading_${Date.now()}`}>
        <ActivityIndicator />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0 ,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#000000',
    opacity: 0.3
  }
})
