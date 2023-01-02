import { useEffect, useState } from 'react'
import React from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import axios from 'axios';

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
  const router = useRouter();
    return (
      <nav className="w-64 flex flex-col h-screen border-r-2 border-black">
          {/* <form>
            <input className="w-full h-12 text-center border border-right" type="text" placeholder="Search player" />
          </form> */}
          <Link href='/' className="m-2 p-2 h-12 text-center border border-gray-300 bg-gray-100 hover:bg-gray-300">
            HOME
          </Link>
          <Link href='/game' className="m-2 p-2 h-12 text-center border border-gray-300 bg-gray-100 hover:bg-gray-300">
            GAME
          </Link>
          <Link href='/chat' className="m-2 p-2 h-12 text-center border border-gray-300 bg-gray-100 hover:bg-gray-300">
            CHAT
          </Link>
          <Link href='/profile' className="m-2 p-2 h-12 text-center border border-gray-300 bg-gray-100 hover:bg-gray-300">
            PROFILE
          </Link>
          <Link className="m-2 p-2 h-12 text-center border border-gray-300 bg-gray-100 hover:bg-gray-300"
          href="/api/auth/logout"
          // onClick={()=>{
          //   axios.get('http://127.0.0.1.nip.io/api/auth/logout')
          //   .then((response) => {
          //     window.location.href = "http://127.0.0.1.nip.io";
          //   })
          //   .catch((error) => {
          //     window.location.href = "http://127.0.0.1.nip.io";
          //   })
          // }}
          >
            LOGOUT
          </Link>
      </nav>
    );
}

export default Navbar;