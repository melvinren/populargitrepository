import React from 'react';
import { StyleSheet, Text, View, AsyncStorage, FlatList,Image } from 'react-native';
import UILoading from '../common/UILoading'
import { commaSplit } from '../common/NumberFormat'

export default class App extends React.Component {

  static navigationOptions = {
    title: 'Favorite'
  }

  constructor(props){
    super(props)
    this.state = {
      accountInfo: null,
      loading: false,
      refreshing: false,
      dataSource: []
    }
  }

  componentDidMount(){
    AsyncStorage.getItem('GH_Account', (error, result)=>{
      if(!error && result){
        const accountInfo = JSON.parse(result)
        if(accountInfo){
          this.setState({
            accountInfo: accountInfo
          }, ()=> this.fetchStarred())
        }
      } else {
        this.props.navigation.navigate('SignInPage')
      }
    })
  }

  fetchStarred(){
    this.setState({ loading: true })
    this.loadData()
      .then((data)=>{
        this.setState({
          loading: false,
          dataSource: data
        })
      })
      .catch(()=>{
        this.setState({
          loading: false
        })
      })
  }

  refresh(){
    this.setState({ refreshing: true })
    this.loadData()
      .then((data)=>{
        this.setState({
          refreshing: false,
          dataSource: data
        })
      })
      .catch(()=>{
        this.setState({
          refreshing: false
        })
      })
  }

  loadData(){
    const { accountInfo } = this.state
    const url = `https://api.github.com/users/${accountInfo.login}/starred`
    return new Promise((resolve, reject)=> {
      fetch(url,
        {
          method: 'get',
          headers: {
            'authorization': `token ${accountInfo.access_token}`,
          }
        })
        .then(response=>response.json())
        .then(data=>{
          resolve(data)
        })
        .catch((error)=>{
          reject(error)
        })
      })
  }

  _renderItem({item}){
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.title}>{item.full_name}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{ flexDirection: 'row', height: 28, justifyContent:'center', alignItems: 'center'}}>
            <Text style={styles.author}>Author: </Text>
            <Image style={{width:22, height:22}} source={{uri: item.owner.avatar_url}} />
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.author}>Star:</Text>
            <Text style={styles.author}>{commaSplit(item.stargazers_count)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View>
        { this.state.loading ?
        <UILoading /> :
        <FlatList
          data={this.state.dataSource}
          keyExtractor={(item,index)=>index.toString()}
          renderItem = {this._renderItem}
          onRefresh={() => this.refresh()}
          refreshing={this.state.refreshing}
        />
        }
      </View>
    );
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
