
import { Link, Outlet } from 'react-router'
import logo from '@/assets/logo.svg';


function App() {
  

  return (
    <>
  <nav className="flex justify-between items-center gap-2 p-3 font-bold">
        <Link to="/" className='text-xl md:text-3xl flex items-center text-green-600 gap-1'><img src={logo} alt="Logo" className="h-8 w-8" />AeroFind</Link>
        
        <div className="lg:flex gap-3 lg:gap-5 uppercase">
          <Link className='hover:text-green-600 hover:underline' to="/explore">Explore</Link>
        </div>

      </nav>
      <Outlet />
    </>
  )
}

export default App
