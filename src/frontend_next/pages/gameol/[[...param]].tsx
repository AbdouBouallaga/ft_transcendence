import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const game = () => {
  const router = useRouter()
  const [id , setId] = useState<string>("")
  useEffect(() => {
    if (router.query.param)
      setId(router.query.param[0])
  }, [])

  return (
    <>
    {id}
      <iframe src={"/gameFull/"+id} width="100%" height="100%"></iframe>
    </>)
}


export default game