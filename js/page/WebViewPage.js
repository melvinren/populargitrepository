import React from 'react';
import { StyleSheet, View , Text, WebView,
      AsyncStorage, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons'


export default class App extends React.Component {

  static navigationOptions = ({navigation}) => {
    return {
      title: `${navigation.getParam('title')}`,
      headerLeft: (
        <TouchableOpacity onPress={navigation.getParam('goBack')} style={{ paddingLeft: 10 }}>
          <Ionicons name="ios-arrow-back" size={32} />
        </TouchableOpacity>)
    }
  }

  constructor(props){
    super(props)
    this.state = {
      url: '',
      canGoBack: false
    }
  }

  componentDidMount(){
    const { navigation } = this.props
    console.log(navigation)
    this.setState({
      url: navigation.getParam('url')
    })

    this.props.navigation.setParams({'goBack': this.goBack.bind(this)})
  }

  goBack(){
    if(this.state.canGoBack){
      this.refs._webview.goBack()
    }else{
      this.props.navigation.goBack()
    }
  }

  navigationStateChange(navState){
    this.setState({
      canGoBack: navState.canGoBack
    })
    this.props.navigation.setParams({'title': navState.title})
  }

  render() {
    return (
      <WebView
        ref="_webview"
        source={{ uri: this.state.url}}
        useWebKit = {true}
        startInLoadingState={true}
        onNavigationStateChange={this.navigationStateChange.bind(this)}
      />)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
