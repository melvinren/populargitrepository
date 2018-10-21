import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

import { createBottomTabNavigator, createStackNavigator } from 'react-navigation'
import PopularPage from './PopularPage'
import TrendingPage from './TrendingPage'
import FavoritePage from './FavoritePage'
import MyPage from './my/MyPage'
import SearchPage from './SearchPage'
import ChooseLangaugePage from './ChooseLangaugePage'

const PopularStack = createStackNavigator({
  PopularPage:PopularPage,
  SearchPage: SearchPage
},{
  initialRouteName: 'PopularPage'
})

const TrendingStack = createStackNavigator({
  TrendingPage:TrendingPage,
  ChooseLangaugePage: ChooseLangaugePage
},{
  initialRouteName: 'TrendingPage',
  mode: 'modal'
})

export default createBottomTabNavigator(
  {
    PopularPage: PopularStack,
    TrendingPage: TrendingStack,
    FavoritePage: createStackNavigator({ FavoritePage }),
    MyPage: createStackNavigator({ MyPage })
  },{
    initialRouteName: 'TrendingPage',
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray'
    },
    navigationOptions: ({ navigation }) => ({
      title: navigation.state.routeName.replace('Page',''),
      tabBarIcon: ({tintColor}) => {
        const { routeName } = navigation.state;
        switch (routeName) {
          case "TrendingPage":
            return <Image style={[styles.tabBarIcon, { tintColor: tintColor }]} source={require('../../assets/ic_trending.png')} />
          case "FavoritePage":
            return <Image style={[styles.tabBarIcon, { tintColor: tintColor }]}  source={require('../../assets/ic_favorite.png')} />
          case "MyPage":
            return <Image style={[styles.tabBarIcon, { tintColor: tintColor }]}  source={require('../../assets/ic_my.png')} />
          case "PopularPage":
            return <Image style={[styles.tabBarIcon, { tintColor: tintColor }]}  source={require('../../assets/ic_polular.png')} />
          default:
            return <Image />
        }
      }
    })
  }
)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain'
  }
});
