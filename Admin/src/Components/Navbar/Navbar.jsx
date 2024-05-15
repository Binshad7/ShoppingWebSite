import './Navbar.css'
import navlogo from '../../assets/nav-logo.svg'
import navProfile from '../../assets/nav-profile.svg'
function Navbar() {
  return (
    <div className='navbar'>
      <img className='nav-logo' src={navlogo} alt="" />
      <img src={navProfile} className='nav-profile' alt="" />
    </div>
  )
}

export default Navbar
