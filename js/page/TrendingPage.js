import React from 'react';
import { StyleSheet,
  Text, View , FlatList,
  TouchableHighlight, TouchableOpacity, AsyncStorage,
  SafeAreaView, Picker, Image, ActivityIndicator } from 'react-native';
import HTMLView from 'react-native-htmlview'

import { Dropdown } from 'react-native-material-dropdown';
import UILoading from '../common/UILoading'
import FullLoading from '../common/FullLoading'

export default class App extends React.Component {

  static navigationOptions = {
    title: 'Trending',
    headerBackTitle: null,
  }

  constructor(props){
    super(props)
    this.state = {
      language: '',
      currentTimespan: {since:"daily", value:"today"},
      loading: false,
      refreshing: false,
      dataSource: [],
      timespan: [
        {since:"daily", value:"today"},
        {since:"weekly", value:"this week"},
        {since:"monthly", value:"this month"}
      ],
      access_token: '',
      accountInfo: {},
      fullLoading: false,
    }
    AsyncStorage.multiGet(['currentLanguage','currentTimespan', 'GH_Account'],(err, stores) =>{
      const language = stores[0][1] || 'All'
      const currentTimespan = JSON.parse(stores[1][1] || '{since:"daily", value:"today"}')
      const accountInfo = JSON.parse(stores[2][1] || '{}')
      this.setState({
        language: language,
        currentTimespan: currentTimespan,
        access_token: accountInfo.access_token,
        accountInfo: accountInfo
      }, ()=>this.loadData())
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
    const url = `https://github.com/trending/${lan}?since=${this.state.currentTimespan.since}`
    // console.log(url)
    let headers = {}
    if(this.state.access_token){
      headers ={ headers: { 'authorization': `token ${this.state.access_token}` } }
    }
    return new Promise((resolve, reject) => {
      fetch(url, headers)
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
      const nameReg = new RegExp('<a href="(.*)">\\n?\\s*<span class="text-normal">(.*)</span>(.*)')
      const namere = repostr.match(nameReg)
      const repo_href = namere[1]
      const full_name = namere[2]+namere[3]
      const descriptionReg = new RegExp('<p class="col-9 d-inline-block text-gray m-0 pr-4">([\\s\\S]*)</p>')
      const descre = repostr.match(descriptionReg)
      const description = (descre && descre[1] || '').trim()
      const starReg = new RegExp('([,\\d]+ stars .*)')
      const starre = repostr.match(starReg)
      const star = ((starre && starre[1] || ''))
      const starredReg = new RegExp('starring-container on')
      const starred = starredReg.test(repostr)
      repoList.push({
        repo_href: repo_href,
        full_name:full_name,
        description: description,
        star: star,
        starred: starred
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

  refresh(){
    this.setState({ refreshing: true })
    this.fetchData().then((data)=>{
      this.setState({
        dataSource: data,
        refreshing: false,
      })
    }).catch((err)=>{
      this.setState({
        refreshing: false,
      })
    })
  }

  chooseLanguage(){
    this.props.navigation.navigate('ChooseLangaugePage', {'currentLanguage': this.state.language})
  }

  adjustTimespan(value, index){
    const timespan = this.state.timespan[index]
    AsyncStorage.setItem('currentTimespan',JSON.stringify(timespan))
    this.setState({currentTimespan: timespan}, ()=>{this.loadData()})
  }

  render() {
    return (
      <SafeAreaView>
        <View style={{flexDirection:'row', padding: 10,
            justifyContent:'space-between', alignItems:'center'}}>
          <TouchableHighlight onPress={() => this.chooseLanguage()}>
            <View><Text style={{fontSize: 16}}>language: {this.state.language}</Text></View>
          </TouchableHighlight>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <Text style={{fontSize: 16}}>Trending: </Text>
            <Dropdown
              containerStyle={{width: 110, height: 28, marginLeft:5}}
              dropdownOffset={{top:0,left:0}}
              value={this.state.currentTimespan.value}
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
          onRefresh={() => this.refresh()}
          refreshing={this.state.refreshing}
          renderItem = {this._renderItem}
          ListFooterComponent = {()=>(<View style={{height: 50}}></View>)}
        />
        }
        { this.state.fullLoading && <FullLoading /> }
      </SafeAreaView>
    );
  }

  starRepo(item){
    if(this.state.access_token){
      this.setState({fullLoading: true})
      const url = `https://api.github.com/user/starred${item.repo_href}`
      let requestObj = {
         method: item.starred ? 'DELETE' : 'PUT',
         headers: { 'authorization': `token ${this.state.access_token}` }
       }
       fetch(url, requestObj)
        .then(res=>{
          this.setState({fullLoading: false})
          item.starred = !item.starred
        })
        .catch(error=>{
          this.setState({fullLoading: false})
        })
    }else{
      this.props.navigation.navigate('SignInPage')
    }
  }

  openURL(url){
    this.props.navigation.navigate('WebviewPage', {url: url})
  }

  _renderItem = ({item}) => {
    return (
      <TrendingRepoCell
        item={item}
        starRepo={this.starRepo.bind(this)}
        openURL={this.openURL.bind(this)}/>
    )
  }
}


class TrendingRepoCell extends React.PureComponent {

  constructor(props){
    super(props)
    this.state = {
      starred: props.item.starred
    }
  }

  starRepo(){
    this.setState({ starred: !this.state.starred})
    this.props.starRepo(this.props.item)
  }

  openURL(url){
    this.props.openURL(url)
  }


  render(){
    const { item } = this.props
    const starpng = this.state.starred ? require('../../assets/ic_star.png')
          : require('../../assets/ic_star_border.png')
    return (
      <View style={styles.container}>
        <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
          <View style={{flex: 1}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.title}>{item.full_name}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.author}>{item.star}</Text>
              </View>
            </View>
          </View>
          <View style={{ width: 35, height: 30, padding: 5, justifyContent: 'center'}}>
            <TouchableOpacity onPress={this.starRepo.bind(this)}>
              <Image source={starpng} style={{width: 24, height: 24}} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 5, justifyContent: 'space-between'}}>
          <HTMLView
              value={`<p>${item.description}</p>`}
              stylesheet={{p:styles.description, a:styles.descriptionlink}}
              onLinkPress={(url)=> this.openURL(url)}/>
        </View>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  descriptionlink: {
    fontSize: 14,
    marginBottom: 2,
    color: '#0366d6'
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
