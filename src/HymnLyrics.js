
import "./App.css";
import React, { useEffect } from "react";
import {BackgroundImages} from "./BackgroundImages";


var backgroundImages = [];
var lyrics = [];
var location = 0;
var processImages = true;

function HymnLyrics(props) {

  useEffect(() => {
    location = 0;
    lyrics = []

    backgroundImages  = props.backgroundImages || []
    processImages = backgroundImages.length === 0 ? true : false
    var image = ''

    props.hymn["lyrics"].forEach((strophe, is) => {

      // console.log(strophe)

      for (let i = 0; i < strophe.strophe.length; i++) {
        location = location +1 ;
        if (processImages) {
          backgroundImages.push(BackgroundImages[Math.floor(Math.random() * BackgroundImages.length)]);
          image = backgroundImages[backgroundImages.length - 1]
        } else {
          image = backgroundImages[location]
        }
        lyrics.push(<div className='strophe' style={{ backgroundImage: `url(${image})` }}
        key={location}
        id={location}
        ><div className='innerStrophe'><p>{strophe.strophe[i]}</p><p>{strophe.strophe[i+1]}</p></div></div>)
        i++

        document.querySelectorAll('.strophe').forEach((item, i)=>{
          if (i === props.activeIndex) {
            item.dataset.visible = 'true'
          } else {
            item.dataset.visible = 'false'
          }
        })
      }

      // We have to notify the control page about what images were picked for the backgrounds.
      if (processImages) {
        console.log(`Images picked: `)
        console.log(backgroundImages)
        props.socket.emit('client-picked-images', localStorage.getItem('id'), backgroundImages)
      }


    })

  })


  return (
    <div className="lyrics">
      {lyrics}
    </div>
  );
}

export default HymnLyrics;
