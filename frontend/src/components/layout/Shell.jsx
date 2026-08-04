import Navbar from './Navbar'
import ToastContainer from '../ui/ToastContainer'

export default function Shell({ children }) {
  return (
    <div className="min-h-screen bg-base">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">{children}</main>
      <ToastContainer />
    </div>
  )
}
