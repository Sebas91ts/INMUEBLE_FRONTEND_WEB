import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

export default function HomeUser() {
  return (
    <div className='min-h-screen bg-stone-50'>
      <Navbar />
      <Outlet />
    </div>
  )
}
