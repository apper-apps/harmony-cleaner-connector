import { NavLink } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const Sidebar = ({ className }) => {
const navItems = [
    { to: "/", label: "Dashboard", icon: "LayoutDashboard" },
    { to: "/clients", label: "Clients", icon: "Users" },
    { to: "/jobs", label: "Jobs", icon: "Briefcase" },
    { to: "/proposals", label: "Proposals", icon: "FileText" },
    { to: "/invoices", label: "Invoices", icon: "Receipt" },
    { to: "/calendar", label: "Calendar", icon: "Calendar" },
    { to: "/rates", label: "Rates", icon: "Settings" }
  ]

  return (
    <aside className={cn("w-64 bg-white border-r border-gray-200 shadow-sm", className)}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600">
              <ApperIcon name="Sparkles" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                CleanerConnector
              </h2>
              <p className="text-xs text-gray-500">Business Management</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
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
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
              <ApperIcon name="User" className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">Business Owner</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar