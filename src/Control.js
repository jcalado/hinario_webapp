import hymns from "./assets/songs.json";
import "./App.css";

import image1 from "./assets/images/david-marcu-78A265wPiO4-unsplash.jpg";

import React, { useEffect, useState } from "react";
import HymnLyrics from "./HymnLyrics";
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { IconArrowBarToLeft, IconArrowLeft, IconArrowRight, IconPlug } from "@tabler/icons";


const socket = io("wss://hinario-wss.jcalado.com");


function Control() {
  // const [activeIndex, setActiveIndex] = React.useState(-1);

  const [state, setState] = useState({
    number: 0,
    hino: hymns[0],
    result: hymns[0]["lyrics"].flatMap(a => a.strophe),
    totalSlides: calculateTotalSlides(hymns[0]["lyrics"].flatMap(a => a.strophe)),
    activeIndex: -1
  })

  const [isConnected, setIsConnected] = useState(socket.connected);


  useEffect(() => {


    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('register-control', localStorage.getItem('id'), state.number, state.activeIndex)
      console.log('Socket connected')
    });

    socket.on('control-status', (...args) => {
      console.log(`A carregar o hino de index ${args[0]} escolhido pelo apresentador, no indice ${args[1]}`)

        setState(previousState => ({ ...previousState,
          number: args[0],
          hino: hymns[args[0]],
          activeIndex: args[1],
          result: hymns[args[0]]["lyrics"].flatMap(a => a.strophe),
          totalSlides: calculateTotalSlides(hymns[args[0]]["lyrics"].flatMap(a => a.strophe))
        }))

    });

    socket.on('control-images', (...args) => {
        // setBackgroundImages(args[0]);
        // console.log(`A carregar as imagens escolhidas pelo apresentador`)
        // console.log(backgroundImages)
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
      socket.off('control-status');
      socket.off('control-images');
      socket.off('reset');
    };


  }, [state]);


  function getId(){
    if (localStorage.getItem('id') === null) {
      var id = prompt("Copie ou introduza um ID unico", uuidv4());
      localStorage.setItem('id', id);
    } else {
      console.log(localStorage.getItem('id'))
    }
  }

  function calculateTotalSlides(lyrics){
    return Math.round(lyrics.length%2 === 0 ? lyrics.length/2+1 : Math.round(lyrics.length/2+2))
  }

  function sendMessage(message, peerId, index) {
    console.log(`A enviar mensagem: ${message} com peerId ${peerId} e index ${index}`)
    socket.emit(message, peerId, index)
  }

  const handleNext = () => {
    
    if (state.activeIndex < state.totalSlides-2) {
      sendMessage('control-next', localStorage.getItem('id'), state.activeIndex + 1);
      // setActiveIndex(state.activeIndex + 1)
      setState(previousState => ({ ...previousState, activeIndex: state.activeIndex + 1 }))
    } else {
      console.log('Chegou o fim')
    }

  }
  const handlePrevious = () => {
    if (state.activeIndex > -1) {
      sendMessage('control-previous', localStorage.getItem('id'), state.activeIndex - 1);
      // setActiveIndex(activeIndex - 1)
      setState(previousState => ({ ...previousState, activeIndex: state.activeIndex-1 }))
    } else {
      sendMessage('control-previous', localStorage.getItem('id'), -1);
      setState(previousState => ({ ...previousState, activeIndex: -1 }))
    }
  }

  const handleRestart = () => {
    sendMessage('control-open', localStorage.getItem('id'), state.hino["hymn"]["number"])
  }

  const handleReset = () => { 
    sendMessage('reset', localStorage.getItem('id'))
  }

  const handleShow = (e) => {
    console.log(e.target.value)
    sendMessage('control-open', localStorage.getItem('id'), e.target.value)
  }

  const audioUrl = `https://storage.googleapis.com/data.cpb.com.br/hinario-adventista/novo/audio/instrumental/${state.hino.hymn.number.padStart(3,0)}.mp3`;

  return (
    <div className="App" style={{ "position": "relative" }}>
      <audio id="audio" controls preload="none" src={audioUrl}></audio>
      <span id="server-status" style={{"display": state.activeIndex === -1 ? "block" : "none"}} className={isConnected ? 'green' : 'red blink'}>{ isConnected ? `Ligado à sala: ${localStorage.getItem('id')}` : 'A ligar ao servidor...' }</span>
      <span id="lyrics-end" style={{"display": state.activeIndex+2 >= state.totalSlides ? "block" : "none"}}>FIM DA LETRA</span>
      
      <div className="hymnTitle" style={{ "display": state.activeIndex === -1 ? "flex" : "none", backgroundImage: `url(${image1})` }}>
        <h1>{state.hino["hymn"]["title"]}</h1>
        <h2>{state.hino["hymn"]["verse"]}</h2>
      </div>
      <div id="controlnav">
        <button onClick={handleRestart} title='Reiniciar'>
          <IconArrowBarToLeft></IconArrowBarToLeft>
        </button>
        <button onClick={handlePrevious}>
          <IconArrowLeft></IconArrowLeft>
        </button>
        <span id="slidePosition">
          {state.activeIndex+2} / {state.totalSlides}
        </span>
        <button onClick={handleNext} style={{"opacity": state.totalSlides-2 === state.activeIndex ? "0" : "1"}}>
          <IconArrowRight></IconArrowRight>
        </button>
        <button id="reset" onClick={handleReset} title='Reset'>
          <IconPlug color="red"></IconPlug>
        </button>
      </div>
      <HymnLyrics activeIndex={state.activeIndex} hymn={state.hino} backgroundImages={state.backgroundImages} socket={socket}></HymnLyrics>
      <select id='hymnPicker' onChange={handleShow}>
        {hymns.map((hymn) => <option value={hymn.hymn.number} key={hymn.hymn.number}>{hymn.hymn.number} - {hymn.hymn.title}</option>)}
      </select>
    </div>
  );
}

export default Control;
