import { useRouter } from 'next/router'

export default function navbar() {
  // const router = useRouter()
  // const { isLoggedIn } = router.query
  if (1){
    return (
      <div id="navbar">
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
      <div id="logo">
        {/* <img src="../public/logo.png" alt="Logo"> */}
      </div>
    </div>
    );
  } else {
    return (null);
  }
}