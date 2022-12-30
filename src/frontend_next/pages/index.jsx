import React, { useEffect, useState } from 'react';
import Router from 'next/router';

const index = () => {
    const [data,setData] =useState({})
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

  return (
    <div>
      hello {data.login42}
      <button onClick={()=>{
        const fetchData = async () => {
          // get the data from the api
          const data = await fetch('http://127.0.0.1.nip.io/api/auth/logout');

          Router.push('/login');
          // window.location.href = "http://127.0.0.1.nip.io/login";
          
        }
        const result = fetchData()
        // make sure to catch any error
        .catch(console.error);

      }} className='bg-gray'>LogOut</button>
      </div>
  )
}

export default index