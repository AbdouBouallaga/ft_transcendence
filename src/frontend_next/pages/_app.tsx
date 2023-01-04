import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import Router, {useRouter} from 'next/router';
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar';
import axios from 'axios';
import { waitForDebugger } from 'inspector';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function App({ Component, pageProps , ...AppProps }: AppProps) {
  
  const [Nav_active, setNav_active] = useState(false)
  const [appReady, setappReady] = useState(false)
  const [data,setData] = useState({})
  const router = useRouter();

  async function routeMo(uri:any, nav:boolean, app:boolean, isError:boolean = false){
    const apply = () =>{
      setNav_active(nav);
      setappReady(app);
    }
    if (AppProps.router.route !== '/login' && !isError)
      uri = AppProps.router.route;
    router.push(uri);
    router.events.on('routeChangeComplete', apply)
  }
  useEffect(()=>{
    const fetchData = async () => {
        let appRootContainer = document.getElementById('appRootContainer');
        axios.get('/api/users/me')
        .then((response) => {
          console.log(response);
          setData(response.data);
          if (response.data.login42){
            routeMo('/', true, true);
          }
        })
        .catch((e) => {
          console.log("error");
          routeMo('/login', false, true, true);
        });
      }
      fetchData()
  },[])
    return (
    <>
    <Head>
        <title>Transcendence</title>
        <meta name="description" content="Ping Pong game." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css"
        />
    </Head>
    {appReady && 
     <div id='appRoot' className="min-h-screen flex">
        <div id='appNav' className=''>
          {Nav_active && <Navbar />}
        </div>
        <div id='appRootContainer' className="flex-1 h-screen ">
          <Component {...pageProps} />  
        </div>
      </div>
    }
    </>
    )
}
