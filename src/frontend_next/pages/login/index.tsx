import Head from 'next/head'


// const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Transcendence</title>
        <meta name="description" content="Ping Pong game." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

     <div className='container min-h-screen mx-auto px-4 grid place-items-center '  >

          <div  className='login bg-gray-50 w-[350px] rounded-lg  min-h-[300px] shadow-lg p-2 grid place-items-center ' >
            <button onClick={()=>{ 
            window.location.href = "http://127.0.0.1.nip.io/api/auth/42";
          }} className='text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" width="28" height="28" aria-hidden="true" viewBox="0 -200 960 960"><path d="M32 412.6h330.1V578h164.7V279.1H197.3L526.8-51.1H362.1L32 279.1zM597.9 114.2L762.7-51.1H597.9zM762.7 114.2L597.9 279.1v164.8h164.8V279.1L928 114.2V-51.1H762.7z"></path><path d="M928 279.1L762.7 443.9H928z"></path></svg>
            . Continue with Intra 42</button></div>
     </div>
    </>
  )
  }
