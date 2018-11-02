import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Text,
  InteractionManager
} from 'react-native'
import HomePage from './HomePage'
import WebviewPage from './WebViewPage'

import { createSwitchNavigator, createStackNavigator } from 'react-navigation'

const RootStack = createStackNavigator({
  HomePage:{
    screen: HomePage,
    navigationOptions: {
      header: null
    }
  },
  WebviewPage: WebviewPage
},{
  initialRouteName: 'HomePage'
})

export default class WelcomePage extends Component {
  // componentDidMount(){
  //   const { navigator } = this.props;
  //   this.timer = setTimeout(()=>{
  //     InteractionManager.runAfterInteractions(()=>{
  //       navigator.resetTo({
  //         component: HomePage,
  //         name: 'HomePage',
  //         params: {
  //           theme: ''
  //         }
  //       })
  //     })
  //   }, 500)
  // }

  componentWillUnmount(){
    // this.timer && clearTimeout(this.timer)
  }

  render(){
    return (
      <RootStack />
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
