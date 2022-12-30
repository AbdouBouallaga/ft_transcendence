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

          <div onClick={()=>{ 
            window.location.href = "http://127.0.0.1.nip.io/api/auth/42";
          }} className='bg-gray-50 w-[350px] rounded-lg  min-h-[300px] shadow-lg p-2 grid place-items-center ' > <button className='button'>Conect With 42 </button></div>
     </div>
    </>
  )
  }
