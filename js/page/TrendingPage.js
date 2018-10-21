import React from 'react';
import { StyleSheet, 
  Text, View , FlatList, 
  TouchableHighlight, AsyncStorage,
  SafeAreaView, Picker } from 'react-native';

import { Dropdown } from 'react-native-material-dropdown';
import UILoading from '../common/UILoading'

export default class App extends React.Component {

  static navigationOptions = {
    title: 'Trending',
    headerBackTitle: null,
  }

  constructor(props){
    super(props)
    this.state = {
      language: 'javascript',
      since: 'daily',
      loading: false,
      refreshing: false,
      dataSource: [],
      timespan: [{since:"daily", value:"today"}, {since:"weekly", value:"this week"},{since:"monthly", value:"this month"}]
    }
    AsyncStorage.multiGet(['currentLanguage','currentSince'],(err, stores) =>{
      const language = stores[0][1] || 'All'
      const since = stores[1][1] || 'daily'
      this.setState({language: language, since: since}, ()=>this.loadData())
    })
  }

  componentDidMount(){
    this.didFocusListener = this.props.navigation.addListener('didFocus',
    (payload) => {
      const language = payload.state && payload.state.params && payload.state.params.language || '';
      const currlanguage = this.state.language;
      if(language !== currlanguage && language){
        AsyncStorage.setItem('currentLanguage',language)
        this.setState({language: language}, () => {
          this.loadData()
        })
      }
    })
  }

  componentWillUnmount(){
    this.didFocusListener.remove()
  }

  fetchData(){
    const lan = this.state.language === 'All' ? '' : (this.state.language || '')
    const url = `https://github.com/trending/${lan}?since=${this.state.since}`
    console.log(url)
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response)=>response.text())
        .then((responseData)=>{
          resolve(this.htmlToObject(responseData))
        })
        .catch((error)=>{
          console.warn(error)
          reject({err:true})
        })
    })
  }

  htmlToObject(html){
    const startStr = '<ol class="repo-list">'
    const endStr = '</ol>'
    let repoliststr = html.substring(html.indexOf(startStr), html.indexOf(endStr))
    let repoList = []
    const splitstr = '</li>'
    let splitindex = -1
    while((splitindex = repoliststr.indexOf(splitstr)) > 0){
      const repostr = repoliststr.substring(0, splitindex)
      // console.log(repostr)
      repoliststr = repoliststr.substr(splitindex+splitstr.length)
      const nameReg = new RegExp('<span class="text-normal">(.*)</span>(.*)')
      const namere = repostr.match(nameReg)
      const full_name = namere[1]+namere[2]
      const descriptionReg = new RegExp('<p class="col-9 d-inline-block text-gray m-0 pr-4">\\n(\\s*<g-emoji .*>(.*)<\\/g-emoji>)?(\\n?.*\\n.*)</p>')
      const descre = repostr.match(descriptionReg)
      const description = (descre && ((descre[2]||'') + descre[3].trim()) || '').trim()
      const starReg = new RegExp('(\\d+ stars .*)')
      const starre = repostr.match(starReg)
      const star = ((starre && starre[1] || ''))
      repoList.push({
        full_name:full_name,
        description: description,
        star: star
      })
    }
    return repoList
  }

  loadData(){
    this.setState({ loading: true })
    this.fetchData().then((data)=>{
      this.setState({
        dataSource: data,
        loading: false,
      })
    }).catch((err)=>{
      this.setState({
        loading: false,
      })
    })
  }

  chooseLanguage(){
    this.props.navigation.navigate('ChooseLangaugePage', {'currentLanguage': this.state.language})
  }

  adjustTimespan(value, index){
    const timespan = this.state.timespan[index]
    AsyncStorage.setItem('currentSince',timespan.since)
    this.setState({since: timespan.since}, ()=>{this.loadData()})
  }

  render() {
    return (
      <SafeAreaView>
        <View style={{flexDirection:'row', padding: 10, justifyContent:'space-between', margin:5}}>
          <TouchableHighlight onPress={() => this.chooseLanguage()}>
            <View><Text>language:{this.state.language}</Text></View>
          </TouchableHighlight>
          <View style={{flexDirection:'row'}}>
            <Text style={{marginRight: 5}}>Trending:</Text>
            <Dropdown 
              containerStyle={{width: 100}}
              dropdownOffset={{top:0, left:0}}
              value={this.state.since}
              onChangeText = {(value, index)=>this.adjustTimespan(value, index)}
              data = {this.state.timespan}
              />
          </View>
        </View>
        { this.state.loading ?
        <UILoading /> :
        <FlatList
          data={this.state.dataSource}
          keyExtractor={(item,index)=>index.toString()}
          renderItem = {this._renderItem}
        />
        }
      </SafeAreaView>
    );
  }


  _renderItem({item}){
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.title}>{item.full_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.author}>{item.star}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    marginLeft: 5,
    marginRight: 5,
    marginVertical: 3,
    borderColor: "#dddddd",
    borderStyle: null,
    borderWidth: 0.5,
    borderRadius: 2,
    shadowColor: 'gray',
    shadowOffset: {width:0.5, height:0.5},
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 2
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
    color: '#212121',
    flex: 1
  },
  description: {
    fontSize: 14,
    marginBottom: 2,
    color: '#757575'
  },
  author: {
    fontSize: 14,
    marginBottom: 2,
    color: '#757575'
  },
  listHeader: {
    padding: 10
  }
});