import { useEffect, useRef, useState } from "react";

const PADDLE_MOVE_DISTANCE = 0.8;

const game = () => {
  const [count, setCount] = useState(0)
  
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef();
  const previousTimeRef = useRef();
  
  const animate = time => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      // Pass on a function to the setter of the state
      // to make sure we always have the latest state
      setCount(prevCount => (prevCount + deltaTime * 0.01) % 100);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Make sure the effect runs only once
  
  return(<> <div>{Math.round(count)}</div>
    <div id="" className=' flex flex-col h-full  bg-black bg-opacity-50'>
      <div className="score">
        <div id="my-score">0</div>
        <div id="op-score">0</div>
      </div>
      <div className="relative h-full border-t-2 border-b-2 " id="">
        <div class="ball" id="ball"></div>
        <div class="paddle" id="my-paddle"></div>
        <div class="paddle" id="op-paddle"></div>
      </div>
    </div>
  </>)
}


export default game