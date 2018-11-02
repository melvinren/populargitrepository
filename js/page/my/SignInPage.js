import React from 'react';
import { WebView, AsyncStorage } from 'react-native';


export default class App extends React.Component {
  static navigationOptions = {
    title: 'Sign In'
  }

  receiveMessage(event){
    const eventdata = JSON.parse(event.nativeEvent.data)
    if(eventdata.type === 'SignIn' && eventdata.access_token){
      this.fetchGHAccount(eventdata.access_token)
        .then(data=>{
          const accountInfo = {
            login: data.login,
            avatar: data.avatar_url,
            access_token: eventdata.access_token
          }
          console.log(data)
          AsyncStorage.setItem('GH_Account',
            JSON.stringify(accountInfo),
            (error)=>{
              this.props.navigation.goBack()
            })
        })
    }
  }

  fetchGHAccount(access_token){
    return new Promise((resolve, reject) => {
      return fetch(`https://api.github.com/user?access_token=${access_token}`)
        .then(res => {
          resolve(res.json())
        })
        .catch(()=>{
          reject()
        })
    })
  }

  // navigationStateChange(event){
  //   console.log(event)
  // }


  render(){
    return (
      <WebView
        source={{ uri: `http:192.168.1.73:3333/github/login?v=${new Date().getTime()}`}}
        useWebKit = {true}
        startInLoadingState={true}
        onMessage={this.receiveMessage.bind(this)}
        // onNavigationStateChange={this.navigationStateChange.bind(this)}
      />)
  }
}
