import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import Navbar from '../components/Navbar';

const testcontent = () => {
  return (
    <div className="min-h-screen flex">
    <div className="m-1 flex-1 h-screen container">
      <h1>Content here</h1>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <p>Welcome to the home page</p>
    </div>
    
    </div>
  )
}

const index = () => {
    const [data,setData] = useState({})
useEffect(()=>{

    const fetchData = async () => {
        // get the data from the api
        const data = await fetch('http://127.0.0.1.nip.io/api/users/me');
        // convert data to json
        const json = await data.json();
        setData(json);
        console.log(json);
        return json;
      }
      const result = fetchData()
      // make sure to catch any error
      .catch(console.error);
},[])

  if (data.statusCode === 401)
    Router.push('/login');
    // window.location.href = "http://127.0.0.1.nip.io/login";
  else if (data.login42){
    return (
      <div className="min-h-screen flex">
      <Navbar />
      <div className="m-1 flex-1 h-screen container">
        {testcontent()}
      </div>

      </div>
    )
  }
}
export default index