import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight
} from 'react-native'


export default class WelcomePage extends Component {

  static navigationOptions = {
    title: 'ChooseLanguage'
  }

  constructor(props){
      super(props)
      this.state = {
          languages: ['All', 'javascript', 'swift', 'object-c','java', 'c#','c','c++','python','php','kotlin','html','css','go','ruby'],
          selectedLanguage: '',
      }
  }

  componentDidMount(){
    const selectedLanguage = this.props.navigation.getParam("currentLanguage","All")
    this.setState({ selectedLanguage: selectedLanguage})
  }

  render(){
    return (
      <View style={styles.container}>
        { this.state.languages.map( (lan, index)=> {
          const selected = lan === this.state.selectedLanguage
          const bgColor = selected ? {backgroundColor: 'blue'} : {}
          return (
          <TouchableHighlight key={index} onPress={()=>this.chooseLanguage(lan)}>
            <Text style={[styles.text, bgColor]}>{lan}</Text>
          </TouchableHighlight>)
        })}
      </View>
    )
  }
  chooseLanguage(language){
    this.props.navigation.navigate('TrendingPage', { language: language})
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    flexWrap: 'wrap',
    flexDirection: 'row'
  },
  text: {
      padding: 10,
      margin: 5,
      borderColor: '#dddddd',
      borderWidth: 0.5,
      textAlign: 'center'
  }
});
