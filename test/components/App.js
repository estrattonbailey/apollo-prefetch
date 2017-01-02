import React from 'react'
import Nav from './Nav'

export default class App extends React.Component {
  static test(){
    console.log('test')
  }
  render(){
    return (
      <main>
        <Nav/>
        {this.props.children}
      </main>
    )
  }
}
