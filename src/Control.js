import hymns from "./assets/songs.json";
import "./App.css";

import image1 from "./assets/images/david-marcu-78A265wPiO4-unsplash.jpg";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HymnLyrics from "./HymnLyrics";
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { IconArrowLeft, IconArrowRight, IconPlug } from "@tabler/icons";


const socket = io("wss://hinario-wss.jcalado.com");


function Control() {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  let params = useParams();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [number, setNumber] = useState(params.hymnNumber ? params.hymnNumber - 1 : 0)
  const [hino, setHino] = useState(hymns[number])
  const [backgroundImages, setBackgroundImages] = useState([])
  const [result, setResult] = useState(hino["lyrics"].flatMap(a => a.strophe))

  useEffect(() => {
    console.log("Running useEffect")
    console.log(hino)

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('register-control', localStorage.getItem('id'), number, activeIndex)
      console.log('Socket connected')
    });

    socket.on('control-status', (...args) => {
      console.log("control-status");
      console.log(args)
        setNumber(args[0]);
        setHino(hymns[args[0]]);
        setActiveIndex(args[1]);
        setResult(hino["lyrics"].flatMap(a => a.strophe))
        console.log(`A carregar o hino ${args[0]} escolhido pelo apresentador, no indice ${args[1]}`)

    });

    socket.on('control-images', (...args) => {
        setBackgroundImages(args[0]);
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


  }, [hino, activeIndex, number]);

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

  const handleShow = (e) => {
    console.log(e.target.value)
    sendMessage('control-open', localStorage.getItem('id'), e.target.value)
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
      <select id='hymnPicker' onChange={handleShow}>
        {hymns.map((hymn) => <option value={hymn.hymn.number} key={hymn.hymn.number}>{hymn.hymn.number} - {hymn.hymn.title}</option>)}
      </select>
    </div>
  );
}

export default Control;
