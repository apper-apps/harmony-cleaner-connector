import { useState } from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import Modal from "./Modal"
import ClientForm from "./ClientForm"
import JobForm from "./JobForm"
import ProposalForm from "./ProposalForm"
import InvoiceForm from "./InvoiceForm"

const QuickActions = ({ onRefresh }) => {
  const [activeModal, setActiveModal] = useState(null)

  const quickActions = [
    {
      id: "client",
      label: "Add New Client",
      icon: "UserPlus",
      color: "primary",
      description: "Register a new client"
    },
    {
      id: "job",
      label: "Add New Job",
      icon: "Briefcase",
      color: "success",
      description: "Schedule a cleaning job"
    },
{
      id: "proposal",
      label: "Create Proposal",
      icon: "FileText",
      color: "info",
      description: "Draft a service proposal"
    },
    {
      id: "invoice",
      label: "Create Invoice",
      icon: "Receipt",
      color: "warning",
      description: "Generate a new invoice"
    },
    {
      id: "rates",
      label: "Manage Rates",
      icon: "Settings",
      color: "secondary",
      description: "Configure pricing tiers"
    }
  ]

const handleActionClick = (actionId) => {
    if (actionId === "rates") {
      window.location.href = "/rates"
    } else {
      setActiveModal(actionId)
    }
  }

  const handleCloseModal = () => {
    setActiveModal(null)
  }

  const handleSuccess = () => {
    handleCloseModal()
    if (onRefresh) onRefresh()
  }

const colorClasses = {
    primary: "from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700",
    success: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    info: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    warning: "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
    secondary: "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ApperIcon name="Zap" className="h-5 w-5 text-primary-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className={`group p-4 rounded-lg bg-gradient-to-r ${colorClasses[action.color]} text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg mb-3 group-hover:bg-opacity-30 transition-all duration-200">
                  <ApperIcon name={action.icon} className="h-6 w-6" />
                </div>
                <h4 className="font-medium text-sm mb-1">{action.label}</h4>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal
        isOpen={activeModal === "client"}
        onClose={handleCloseModal}
        title="Add New Client"
        size="md"
      >
        <ClientForm onSubmit={handleSuccess} onCancel={handleCloseModal} />
      </Modal>

      <Modal
        isOpen={activeModal === "job"}
        onClose={handleCloseModal}
        title="Add New Job"
        size="md"
      >
        <JobForm onSubmit={handleSuccess} onCancel={handleCloseModal} />
      </Modal>

      <Modal
        isOpen={activeModal === "proposal"}
        onClose={handleCloseModal}
        title="Create Proposal"
        size="lg"
      >
        <ProposalForm onSubmit={handleSuccess} onCancel={handleCloseModal} />
      </Modal>

      <Modal
        isOpen={activeModal === "invoice"}
        onClose={handleCloseModal}
        title="Create Invoice"
        size="lg"
      >
        <InvoiceForm onSubmit={handleSuccess} onCancel={handleCloseModal} />
      </Modal>
    </>
  )
}

export default QuickActions