import hymns from "./assets/songs.json";
import "./App.css";

import {BackgroundImages} from "./BackgroundImages";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HymnLyrics from "./HymnLyrics";

import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io("ws://127.0.0.1:4000");

function App() {
  const [activeIndex, setActiveIndex] = React.useState(-1);  


  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);

  let params = useParams();

  var number = params.hymnNumber ? params.hymnNumber - 1 : 0;
  const hino = hymns[number];
  let result = hino["lyrics"].flatMap(a => a.strophe);

  var isDebug = false;


  function getId(){
    if (localStorage.getItem('id') === null || localStorage.getItem('id') === 'null') {
      var id = prompt("Copie ou introduza um ID unico", uuidv4());
      localStorage.setItem('id', id);
    } else {
      console.log(localStorage.getItem('id'))
    }
  }

  useEffect(() => {
    socket.removeAllListeners();
    getId()

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('register-client', localStorage.getItem('id'), number)
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('pong', () => {
      setLastPong(new Date().toISOString());
      console.log('pong')
    });

    socket.on('client-next', (...args) => {
      if (args[0] === localStorage.getItem('id')) {
        setActiveIndex(args[1])
        console.log(`A definir index ${args[1]}`)
      }
    });

    socket.on('client-previous', (...args) => {
      if (args[0] === localStorage.getItem('id')) {
        setActiveIndex(args[1])
        console.log(`A definir index ${args[1]}`)
      }
    });

    socket.on('client-number', (...args) => {
      if (args[0] === localStorage.getItem('id')) {
        socket.emit('client-answer-number', localStorage.getItem('id'), number)
        console.log(`A responder ao controlo com id ${args[0]} que estou no numero ${number}`)
      }
    });

    socket.on('reset', (...args) => {
      if (args[0] === localStorage.getItem('id')) {
        localStorage.removeItem('id')
        console.log(`A fazer reset...`)
      }
    });


    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
      socket.off('client-next');
      socket.off('client-previous');
      socket.off('client-number');
      socket.off('client-reset');
    };

  }, [isConnected, number, socket]);


  return (
    <div className="App">
      <div className="hymnTitle" style={{"display": activeIndex === -1 ? "flex" : "none", backgroundImage: `url(${BackgroundImages[0]})`}}>
        <h1>{hino["hymn"]["title"]}</h1>
        <h2>#{hino["hymn"]["number"]}</h2>
        <h3>{hino["hymn"]["verse"]}</h3>
      </div>
      <HymnLyrics activeIndex={activeIndex} hymn={hino} socket={socket}></HymnLyrics>
      <div id="debug" style={{"display": isDebug ? 'block' : 'none' }}>
        <span>ID: {localStorage.getItem('id')}</span>
      </div>
    </div>
  );
}

export default App;
