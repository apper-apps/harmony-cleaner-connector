import { NavLink } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { cn } from "@/utils/cn"

const MobileSidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { to: "/", label: "Dashboard", icon: "LayoutDashboard" },
    { to: "/clients", label: "Clients", icon: "Users" },
    { to: "/jobs", label: "Jobs", icon: "Briefcase" },
    { to: "/proposals", label: "Proposals", icon: "FileText" },
    { to: "/invoices", label: "Invoices", icon: "Receipt" },
    { to: "/calendar", label: "Calendar", icon: "Calendar" }
  ]

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className={cn(
        "fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600">
                <ApperIcon name="Sparkles" className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  CleanerConnector
                </h2>
                <p className="text-xs text-gray-500">Business Management</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary-50 hover:text-primary-700 group",
                        isActive 
                          ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-r-2 border-primary-500 shadow-sm" 
                          : "text-gray-700 hover:shadow-sm"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <ApperIcon 
                          name={item.icon} 
                          className={cn(
                            "h-5 w-5 transition-colors duration-200",
                            isActive ? "text-primary-600" : "text-gray-500 group-hover:text-primary-600"
                          )}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

export default MobileSidebar