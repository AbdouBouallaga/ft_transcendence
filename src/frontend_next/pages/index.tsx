import React, { useEffect, useState } from 'react';
import { Stream } from 'stream';

const Index = (props: any) => {
  return (
    <>
      <Test />
    </>
  )
};

export default Index;

const Test = (props:any) => {
  
  return (
    <div className="flex">
      <div className="m-1 flex-1 container">
        <h1>Content here</h1>
        {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> */}
        <p>Welcome to the home page</p>
      </div>

    </div>
  )
}