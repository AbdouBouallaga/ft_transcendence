import { useEffect, useState } from 'react'
import React from 'react';
import Router from 'next/router';

// function logout() {
//   const fetchData = async () => {
//     // get the data from the api
//     const data = await fetch('http://127.0.0.1.nip.io/api/auth/logout');

//     Router.push('/login');
//     // window.location.href = "http://127.0.0.1.nip.io/login";
    
//   }
//   const result = fetchData()
//   // make sure to catch any error
//   .catch(console.error);
// }
const Navbar = () => {
    return (
      <nav className="w-64 flex flex-col h-screen border-r-2 border-black">
          <form>
            <input className="w-full h-12 text-center border border-right" type="text" placeholder="Search player" />
          </form>
          <button className="m-2 h-12 text-center border border-gray-300 hover:bg-gray-100">
            GAME
          </button>
          <button className="m-2 h-12 text-center border border-gray-300 hover:bg-gray-100">
            PROFILE
          </button>
          <button className="m-2 h-12 text-center border border-gray-300 hover:bg-gray-100"
          onClick={()=>{
            const fetchData = async () => {
              // get the data from the api
              const data = await fetch('http://127.0.0.1.nip.io/api/auth/logout');
    
              Router.push('/login');
              // window.location.href = "http://127.0.0.1.nip.io/login";
              
            }
            const result = fetchData()
            // make sure to catch any error
            .catch(console.error);
    
          }}
          >
            LOGOUT
          </button>
      </nav>
    );
}

export default Navbar;