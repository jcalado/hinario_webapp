
import "./App.css";
import React, { useEffect, useState } from "react";
import {BackgroundImages} from "./BackgroundImages";


var backgroundImages = [];
var location = 0;
var processImages = true;

function HymnLyrics(props) {

  const [lyrics, setLyrics] = useState(null)

  useEffect(() => {
    location = 0;
    var holder = []

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
        holder.push(<div className='strophe' style={{ backgroundImage: `url(${image})` }}
        key={location}
        id={location}
        data-visible={holder.length === props.activeIndex}
        ><div className='innerStrophe'><p>{strophe.strophe[i]}</p><p>{strophe.strophe[i+1]}</p></div></div>)
        i++
      }
    })

    setLyrics(holder)
    // We have to notify the control page about what images were picked for the backgrounds.
    if (processImages) {
      // console.log(`Images picked: `)
      // console.log(backgroundImages)
      props.socket.emit('client-picked-images', localStorage.getItem('id'), holder)
    }

  },[props.hymn, props.activeIndex, props.backgroundImages, props.socket])


  return (
    <div className="lyrics">
      {lyrics}
    </div>
  );
}

export default HymnLyrics;
