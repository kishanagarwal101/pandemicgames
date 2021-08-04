import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './Pages/Home/Home';
import Lobby from './Pages/Lobby/Lobby';
import TicTacToe from './Pages/TicTacToe/TicTacToe';
import Shazam from './Pages/Shazam/Shazam'
function App() {
  return (
    <div className="App">
      <ToastContainer />
      <Router>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/lobby" render={(props) => <Lobby {...props} />} />
          <Route path="/tictactoe" render={(props) => <TicTacToe {...props} />} />
          <Route path="/shazam" render={(props) => <Shazam {...props} />} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
