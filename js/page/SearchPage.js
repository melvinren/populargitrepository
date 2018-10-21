import React from 'react';
import { StyleSheet, Text, View, TextInput, Button ,
  TouchableHighlight, AsyncStorage } from 'react-native';

export default class App extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {
        headerTitle:(
          <View style={{flex:1}}>
            <TextInput
              style={styles.searchText}
              placeholder="search"
              onChangeText={navigation.getParam('textChange')}
              returnKeyType='search'
              returnKeyLabel='search'
              onEndEditing={navigation.getParam('search')}/>
          </View>
        ),
        headerRight:(
          <Button onPress={navigation.getParam('search', ()=>{})} title='搜索' />
        ),
        // headerStyle: {
        //   backgroundColor: '#f4511e'
        // },
        // headerLeft: (
        //   <TouchableHighlight onPress={navigation.getParam('goBack', ()=>{})}>
        //     <View style={{padding:8}}>
        //       <Text style={{color:'blue', fontSize: 30}}>{"<"}</Text>
        //     </View>
        //   </TouchableHighlight>
        // )
      }
  }

  constructor(props){
    super(props)
    this.state={
      text:'',
      historySearchList: []
    }
    this.loadHistorySearch()
  }

  componentDidMount(){
    const { navigation } = this.props
    navigation.setParams({
      search: this.search,
      textChange: this.textChange,
      goBack: this.goBack,
    })
  }

  loadHistorySearch(){
    // load history serach records
    AsyncStorage.getItem('historySearchList', (error, result)=>{
      if(!error){
        result = result
        let resultArray = []
        if(result){
          resultArray = result.split(',')
        }
        this.setState({ historySearchList: resultArray })
      }
    })
  }

  clearHistory(){
    AsyncStorage.removeItem('historySearchList', ()=>{
      this.setState({ historySearchList: [] })
    })
  }

  textChange = (text) => {
    this.setState({
      text: text
    })
  }

  search = ()=>{
    const searchText = this.state.text;
    this.searchAction(searchText)
  }

  searchAction = (searchText) => {
    if(searchText.trim() != ''){
      AsyncStorage.setItem('currSearchText', searchText.trim())
      AsyncStorage.getItem('historySearchList', (error, result)=>{
        if(!error){
          result = result
          let resultArray = []
          if(result){
            resultArray = result.split(',')
          }
          const _idx = resultArray.indexOf(searchText.trim())
          if(_idx >= 0){
           resultArray.splice(_idx, 1)
          }
          resultArray.unshift(searchText.trim())
          AsyncStorage.setItem('historySearchList', resultArray.join(','))
        }
      })
      this.props.navigation.navigate('PopularPage', { searchText: searchText.trim()})
    }else{
      this.props.navigation.goBack()
    }
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  render() {
    const { historySearchList } = this.state;
    //console.log(historySearchList)
    return (
      <View style={styles.container}>
        { historySearchList.length > 0 ?
          <View>
            <View style={styles.historyTitleWrap}>
              <Text style={styles.historyTitle}>搜索历史</Text>
              <TouchableHighlight onPress={()=>this.clearHistory()}><Text style={styles.historyTitle}>清除记录</Text></TouchableHighlight>
            </View>
            <View style={{flexDirection:'row', flexWrap: 'wrap'}}>
            {
              historySearchList.map((searchText, index)=> (
                <TouchableHighlight key={index} onPress={()=>this.searchAction(searchText)}>
                  <Text style={styles.historyText} >{searchText}</Text>
                </TouchableHighlight>
              ))
            }
            </View>
          </View> : ''
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchText:{
    borderColor: "#dddddd",
    borderStyle: null,
    borderWidth: 0.5,
    borderRadius: 2,
    shadowColor: 'gray',
    shadowOffset: {width:0.5, height:0.5},
    shadowOpacity: 0.4,
    shadowRadius: 1,
    height: 30,
  },
  historyTitleWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: "#c8c8c8",
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  historyTitle: {
    fontSize: 16,
    padding:10,
    marginTop: 5,
    fontWeight: '500',
  },
  historyText:{
    borderColor: "#dddddd",
    backgroundColor: '#f5f5f5',
    borderStyle: null,
    borderWidth: 0.5,
    borderRadius: 2,
    padding: 5,
    textAlign: 'center',
    marginRight: 5,
    marginLeft: 5,
    marginTop: 5,
  }
})
