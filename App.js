import React from 'react';
import { Navigator } from 'react-native-deprecated-custom-components';
import WelcomePage from './js/page/WelcomePage'

export default class App extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  _renderScene(route, navigator){
    let Component = route.component;
    return (
      <Component {...route.params} navigator={navigator} />
    )
  }

  render() {
    return (
      <Navigator
        initialRoute = {{
          name:'WelcomePage',
          component: WelcomePage
        }}
        renderScene={(e,i)=>this._renderScene(e,i)}
      />
    );
  }
}
