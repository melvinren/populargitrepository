import React from 'react';
import { StyleSheet, Text, View, FlatList, Image,
  TouchableOpacity, AsyncStorage } from 'react-native';
// import { createMaterialTopTabNavigator } from 'react-navigation'

import UILoading from '../common/UILoading'
import { Ionicons } from '@expo/vector-icons'
import { relativeTime } from '../common/DateFormat'
import { commaSplit } from '../common/NumberFormat'


export default class PopularPage extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Popular',
      headerBackTitle: null,
      headerRight: (
        <TouchableOpacity
          onPress={navigation.getParam('search')}
        >
          <View style={{padding: 5}}>
            <Image style={{width:24, height:24, tintColor: 'blue'}} source={require('../../assets/ic_search_white_48pt.png')} />
          </View>
        </TouchableOpacity>
      )
    }
  }

  page = 1
  per_page = 20
  limit_count = 100

  constructor(props){
    super(props)
    this.state = {
      dataSource : [],
      refreshing: false,
      loading: false,
      finished: false,
      q: 'javascript',
      result_count: 0,
      access_token: ''
    }

  }

  componentDidMount(){
    this.props.navigation.setParams({search: this.search})
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (payload) => {
        const searchText = payload.state && payload.state.params && payload.state.params.searchText || '';
        const currSearchText = this.state.q;
        if(searchText !== currSearchText && searchText){
          console.log('load new data')
          this.setState({q: searchText}, () => {
            this.loadData()
          })
        }
      })

    AsyncStorage.multiGet(['currSearchText','GH_Account'],(err, stores) =>{
      const q = stores[0][1] || 'javascript'
      const accountInfo = JSON.parse(stores[1][1] || '{}')
      this.setState({q: q, access_token: accountInfo.access_token}, () => {
        this.loadData()
      })
    })
  }

  componentWillUnmount(){
    this.didFocusListener.remove()
  }

  loadData() {
    this.setState({ loading: true, finished: false })
    this.page = 1; //reset;
    this.fetchData().then((data)=>{
      this.setState({
        dataSource: data.items,
        loading: false,
        result_count: data.total_count
      })
    }).catch((err)=>{
      this.setState({
        loading: false
      })
    })
  }

  fetchData(){
    const url = `https://api.github.com/search/repositories?q=${this.state.q}&per_page=${this.per_page}&page=${this.page}`
    let headers = {}
    if(this.state.access_token){
      headers ={ headers: { 'authorization': `token ${this.state.access_token}` } }
    }
    return new Promise((resolve, reject) => {
      fetch(url, headers)
        .then((response)=>response.json())
        .then((responseData)=>{
          resolve(responseData)
        })
        .catch((error)=>{
          console.warn(error)
          reject({err:true})
        })
    })
  }

  _loadNext(){
    const loadeddatacount = this.page * this.per_page
    if(loadeddatacount >= this.state.result_count || loadeddatacount >= this.limit_count){
      this.setState({ finished: true })
      return;
    }
    this.page++
    this.setState({ refreshing: true })
    this.fetchData().then((data)=>{
      const { dataSource } = this.state
      this.setState({
        refreshing: false,
        dataSource: dataSource.concat(data.items),
      })
    }).catch(()=>{
      this.setState({refreshing: false})
      this.page--
    })
  }

  _renderListHeader(){
    return (
      <View style={styles.listHeader}>
        <Text>{`Search: ${this.state.q}, ${commaSplit(this.state.result_count)} repository results`}</Text>
      </View>
    )
  }

  _renderListFooter(){
    return(
      <View style={{flex:1, justifyContent:'center', alignItems: 'center', marginBottom: 20}}>
      {this.state.finished ?
        <Text>已经显示{this.page*this.per_page}条数据，不能展示更多数据了</Text>
        : <UILoading />
      }
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
          renderItem = {this._renderItem.bind(this)}
          onRefresh={() => this.loadData()}
          refreshing={this.state.refreshing}
          onEndReachedThreshold={0.5}
          onEndReached={() => this._loadNext()}
          ListHeaderComponent={() => this._renderListHeader()}
          ListFooterComponent={() => this._renderListFooter()}
        />
        }
      </View>
    );
  }

  openURL(item){
    this.props.navigation.navigate('WebviewPage', {
          url: item.html_url,
          title: item.full_name
        })
  }

  _renderItem({item}){
    return (
      <TouchableOpacity onPress={()=>this.openURL(item)}>
        <View style={styles.container}>
          <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
            <View style={{flex: 1}}>
              <View style={{ flexDirection: 'row'}}>
                <Text style={styles.title}>{item.full_name}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[...styles.author, {color: '#ffac45'}]}>{item.language ? item.language + '   ' : ''}</Text>
                <Text style={styles.author}>{relativeTime(item.pushed_at)}</Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center', padding: 5}}>
              <Ionicons name="ios-star" size={14} />
              <Text style={[...styles.author, {marginLeft: 2}]}>{commaSplit(item.stargazers_count)}</Text>
            </View>
          </View>
          <View style={{marginVertical: 5, marginBottom: 0}}>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  search =() => {
    this.props.navigation.navigate("SearchPage",{ SearchText: this.state.q})
  }
}

// export default createMaterialTopTabNavigator(
//   {
//     All: PopularPage,
//     IOS: PopularPage,
//     React: PopularPage
//   },{
//     initialRouteName: 'All',
//     navigationOptions: ({ navigation }) => ({
//       title: navigation.state.routeName
//     })
//   }
// )

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
