import hymns from "./assets/songs.json";
import "./App.css";

import image1 from "./assets/images/david-marcu-78A265wPiO4-unsplash.jpg";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import HymnLyrics from "./HymnLyrics";
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { IconArrowLeft, IconArrowRight, IconPlug } from "@tabler/icons";


const socket = io("ws://127.0.0.1:4000");


function Control() {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  let params = useParams();
  let number = params.hymnNumber ? params.hymnNumber - 1 : 0;

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);
  const [hino, setHino] = useState(hymns[number])
  const [backgroundImages, setBackgroundImages] = useState([])
  let result = hino["lyrics"].flatMap(a => a.strophe);

  useEffect(() => {
    
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('register-control', localStorage.getItem('id'), number)
      console.log('Socket connected')
    });

    socket.on('client-next', (...args) => {
      console.log('Foi-me pedido para avancar, mas eu sou controlo!')
      console.log(args);
    });

    socket.on('control-number', (...args) => {
      if (args[0] === localStorage.getItem('id')) {
        setHino(hymns[args[1]])
        console.log(`A carregar o hino ${args[1]} escolhido pelo apresentador`)
      }
    });

    socket.on('control-images', (...args) => {
      if (args[0] === localStorage.getItem('id')) {
        setBackgroundImages(args[1])
        console.log(`A carregar as imagens escolhido pelo apresentador`)
        console.log(backgroundImages)
      }
    });

    socket.on('reset', (...args) => {
      if (args[0] === localStorage.getItem('id')) {
        localStorage.removeItem('id')
        console.log(`A fazer reset...`)
        getId()
      }
    });

    return () => {
      socket.off('connect');
      socket.off('client-next');
      socket.off('control-number');
      socket.off('control-images');
      socket.off('reset');
    };


  }, [isConnected, number, backgroundImages]);

  function getId(){
    if (localStorage.getItem('id') === null) {
      var id = prompt("Copie ou introduza um ID unico", uuidv4());
      localStorage.setItem('id', id);
    } else {
      console.log(localStorage.getItem('id'))
    }
  }


  function sendMessage(message, peerId, index) {
    console.log(`A enviar mensagem: ${message} com peerId ${peerId} e index ${index}`)
    socket.emit(message, peerId, index)
  }

  const handleNext = () => {
    console.log(result)

    if (activeIndex < result.length/2 - 1 ) {
      sendMessage('control-next', localStorage.getItem('id'), activeIndex + 1);
      setActiveIndex(activeIndex + 1)
    } else {
      console.log('Chegou o fim')
    }

  }
  const handlePrevious = () => {
    
    if (activeIndex > -1) {
      sendMessage('control-previous', localStorage.getItem('id'), activeIndex - 1);
      setActiveIndex(activeIndex - 1)
    } else {
      sendMessage('control-previous', localStorage.getItem('id'), -1);
      setActiveIndex(-1)
    }
  }
  const handleReset = () => { 
    sendMessage('reset', localStorage.getItem('id'))
  }

  const audioUrl = `https://storage.googleapis.com/data.cpb.com.br/hinario-adventista/novo/audio/instrumental/${hino.hymn.number.padStart(3,0)}.mp3`;

  return (
    <div className="App" style={{ "position": "relative" }}>
      <audio id="audio" controls preload="none" src={audioUrl}></audio>
      <span id="server-status" style={{"display": activeIndex === -1 ? "block" : "none"}} className={isConnected ? 'green' : 'red blink'}>{ isConnected ? `Ligado à sala: ${localStorage.getItem('id')}` : 'A ligar ao servidor...' }</span>
      <span id="lyrics-end" style={{"display": activeIndex >= result.length/2 - 1 ? "block" : "none"}}>FIM DA LETRA</span>
      
      <div className="hymnTitle" style={{ "display": activeIndex === -1 ? "flex" : "none", backgroundImage: `url(${image1})` }}>
        <h1>{hino["hymn"]["title"]}</h1>
        <h2>{hino["hymn"]["verse"]}</h2>
      </div>
      <div id="controlnav">
        <button onClick={handlePrevious}>
          <IconArrowLeft></IconArrowLeft>
        </button>
        <button onClick={handleNext} style={{"opacity": activeIndex >= result.length/2 - 1 ? "0" : "1"}}>
          <IconArrowRight></IconArrowRight>
        </button>
        <button id="reset" onClick={handleReset} title='Reset'>
          <IconPlug color="red"></IconPlug>
        </button>
      </div>
      <HymnLyrics activeIndex={activeIndex} hymn={hino} backgroundImages={backgroundImages} socket={socket}></HymnLyrics>
    </div>
  );
}

export default Control;
