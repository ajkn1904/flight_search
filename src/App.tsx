
import { Link, Outlet } from 'react-router'
import logo from '@/assets/logo.svg';
import { ModeToggle } from './components/utility/ModeToggler';


function App() {


  return (
    <>
      <nav className="flex justify-between items-center gap-2 p-3 font-bold">
        <Link to="/" className='text-xl md:text-3xl flex items-center text-green-600 gap-1'><img src={logo} alt="Logo" className="h-8 w-8" />AeroFind</Link>

        <ModeToggle />

      </nav>
      <Outlet />
    </>
  )
}

export default App
