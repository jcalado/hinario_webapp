import hymns from "./assets/songs.json";
import "./App.css";

import { BackgroundImages } from "./BackgroundImages";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HymnLyrics from "./HymnLyrics";

import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io("wss://hinario-wss.jcalado.com");

function App() {
  let params = useParams();
  let number = params.hymnNumber ? params.hymnNumber - 1 : 0;

  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [hino, setHino] = useState(hymns[number]);



  let isDebug = false;

  let navigate = useNavigate();

  function getId() {
    if (localStorage.getItem('id') === null || localStorage.getItem('id') === 'null') {
      let id = prompt("Copie ou introduza um ID unico", uuidv4());
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
      socket.emit('register-client', localStorage.getItem('id'), number, activeIndex)
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('client-next', (...args) => {
      setActiveIndex(args[0])
      console.log(`A definir index ${args[0]}`)
    });

    socket.on('client-previous', (...args) => {
      setActiveIndex(args[0])
      console.log(`A definir index ${args[0]}`)
    });

    socket.on('client-status', (...args) => {
      socket.emit('client-answer-status', localStorage.getItem('id'), number, activeIndex)
      console.log(`A responder ao controlo com id ${args[0]} que estou no numero ${number} e no indice ${activeIndex}`)
    });

    socket.on('client-open', (...args) => {
      navigate(`/${args[0]}`)
      setHino(hymns[args[0] - 1])
      socket.emit('client-answer-status', localStorage.getItem('id'), args[0] - 1, -1)
      console.log(`A abrir index ${args[1]}`)
    });

    socket.on('reset', (...args) => {
      localStorage.removeItem('id')
      console.log(`A fazer reset...`)
    });


    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('client-next');
      socket.off('client-previous');
      socket.off('client-status');
      socket.off('client-reset');
    };

  }, [isConnected, number, hino, navigate, activeIndex]);


  return (
    <div className="App">
      <div className="hymnTitle" style={{ "display": activeIndex === -1 ? "flex" : "none", backgroundImage: `url(${BackgroundImages[0]})` }}>
        <h1>{hino["hymn"]["title"]}</h1>
        <h2>#{hino["hymn"]["number"]}</h2>
        <h3>{hino["hymn"]["verse"]}</h3>
      </div>
      <HymnLyrics activeIndex={activeIndex} hymn={hino} socket={socket}></HymnLyrics>
      <div id="debug" style={{ "display": isDebug ? 'block' : 'none' }}>
        <span>ID: {localStorage.getItem('id')}</span>
      </div>
    </div>
  );
}

export default App;
