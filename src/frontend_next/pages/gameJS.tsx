import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const PADDLE_MOVE_DISTANCE = 0.8;

const game = () => {

  return(
  <>
    {/* <div  className='gamecontainer flex flex-col h-full bg-black bg-opacity-50'>
      <div className="score">
        <div id="my-score">0</div>
        <div id="op-score">0</div>
      </div>
      <div className="relative h-full border-t-2 border-b-2 " id="">
        <div className="ball" id="ball"
        ></div>
        <div className="paddle" id="my-paddle"></div>
        <div className="paddle" id="op-paddle"></div>
      </div>
    </div> */}
    <div id="game-screen" className="flex flex-col h-full bg-black bg-opacity-50">
      <div className="score">
        <div id="my-score">0</div>
        <div id="op-score">0</div>
      </div>
      <div className="ball" id="ball"></div>
      <div className="paddle" id="my-paddle"></div>
      <div className="paddle" id="op-paddle"></div>
    </div>
    {/* <div id="room-input">
      <div className="form-group">
        <input type="text" placeholder="Enter Room" id="room-id" />
      </div>
      <button type="submit" className="btn btn-success" id="join-button">
        Join Game
      </button>
    </div> */}
    <Script src="/static/gameLogic.js" type="module"/>
  </>)
}


export default game