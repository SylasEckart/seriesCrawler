import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
const {remote, ipcRenderer} = window.require('electron')
, fs = remote.require('fs')
, sharedObject = remote.getGlobal('sharedObject');

console.log(sharedObject.result)
class App extends Component {
  constructor(){
    super()
    this.state = { data : []}
  }
  async componentDidMount(){
    
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
        </p>
      </div>
    );
  }
}

export default App;
