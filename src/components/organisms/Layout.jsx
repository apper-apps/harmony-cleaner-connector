import { useState } from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"
import MobileSidebar from "./MobileSidebar"

const Layout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar className="hidden lg:block" />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={closeMobileSidebar}
        />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onToggleMobileSidebar={toggleMobileSidebar} />
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout