import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Text,
  InteractionManager
} from 'react-native'
import HomePage from './HomePage'

export default class WelcomePage extends Component {
  componentDidMount(){
    const { navigator } = this.props;
    this.timer = setTimeout(()=>{
      InteractionManager.runAfterInteractions(()=>{
        navigator.resetTo({
          component: HomePage,
          name: 'HomePage',
          params: {
            theme: ''
          }
        })
      })
    }, 500)
  }

  componentWillUnmount(){
    this.timer && clearTimeout(this.timer)
  }

  render(){
    return (
      <View style={styles.container}>
        <Text>Welcome!</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
