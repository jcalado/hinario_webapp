
import "./App.css";
import React, { useEffect, useState } from "react";
import {BackgroundImages} from "./BackgroundImages";
import { useParams } from "react-router-dom";

var images = [];
var location = 0;
var processImages = true;

function HymnLyrics(props) {

  const [lyrics, setLyrics] = useState([])
  let params = useParams();
  let room = params.room

  useEffect(() => {
    location = 0;
    var holder = []
    var image = ''
    images = []

    props.hymn["lyrics"].forEach((strophe, is) => {
      for (let i = 0; i < strophe.strophe.length; i++) {
        location = location +1 ;
        if (processImages) {
          images.push(BackgroundImages[Math.floor(Math.random() * BackgroundImages.length)]);
          image = images[images.length - 1]
        } else {
          image = images[location]
        }
        holder.push(<div className='strophe' style={{ backgroundImage: `url(${image})` }}
        key={location}
        id={location}
        data-visible={holder.length === props.activeIndex}
        ><div className='innerStrophe'><p>{strophe.strophe[i]}</p><p>{strophe.strophe[i+1]}</p></div></div>)
        i++
      }
    })

    // Preload images

    images.forEach((image) => {
      const img = new Image();
      img.src = image;
      // console.log(img)
    });

    // setBackgroundImages(images)
    setLyrics(holder)
    // We have to notify the control page about what images were picked for the backgrounds.
    if (processImages) {
      // console.log(`Images picked: `)
      // console.log(backgroundImages)
      props.socket.emit('client-picked-images', room, holder)
    }

  },[props.hymn, props.activeIndex, props.socket, room])


  return (
    <div className="lyrics">
      {lyrics}
    </div>
  );
}

export default HymnLyrics;
