import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import StatusBadge from "@/components/molecules/StatusBadge"
import Modal from "@/components/organisms/Modal"
import ClientForm from "@/components/organisms/ClientForm"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import ApperIcon from "@/components/ApperIcon"
import { clientService } from "@/services/api/clientService"
import { format } from "date-fns"

const ClientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [activeTab, setActiveTab] = useState("jobs")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const tabs = [
    { id: "jobs", label: "Jobs", icon: "Briefcase" },
    { id: "proposals", label: "Proposals", icon: "FileText" },
    { id: "invoices", label: "Invoices", icon: "Receipt" },
    { id: "contact", label: "Contact Info", icon: "User" }
  ]

  useEffect(() => {
    loadClient()
  }, [id])

  const loadClient = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await clientService.getById(id)
      if (!data) {
        setError("Client not found.")
        return
      }
      setClient(data)
    } catch (err) {
      setError("Failed to load client details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditClient = () => {
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = () => {
    setIsEditModalOpen(false)
    loadClient()
  }

  if (loading) {
    return <Loading message="Loading client details..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadClient} />
  }

  if (!client) {
    return <Error message="Client not found" />
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/clients")}
        >
          <ApperIcon name="ArrowLeft" className="h-4 w-4" />
          Back to Clients
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600">
              <ApperIcon name="User" className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{client.name}</h1>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ApperIcon name="Mail" className="h-4 w-4" />
                  {client.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ApperIcon name="Phone" className="h-4 w-4" />
                  {client.phone}
                </div>
                {client.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="MapPin" className="h-4 w-4" />
                    {client.address}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditClient}>
              <ApperIcon name="Edit" className="h-4 w-4" />
              Edit Client
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{client.jobs?.length || 0}</p>
            <p className="text-sm text-gray-600">Total Jobs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{client.proposals?.length || 0}</p>
            <p className="text-sm text-gray-600">Proposals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{client.invoices?.length || 0}</p>
            <p className="text-sm text-gray-600">Invoices</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <ApperIcon name={tab.icon} className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "jobs" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ApperIcon name="Briefcase" className="h-5 w-5" />
                Jobs ({client.jobs?.length || 0})
              </h3>
              {client.jobs?.length > 0 ? (
                <div className="space-y-3">
                  {client.jobs.map((job) => (
                    <Card key={job.Id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{job.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{job.jobType}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <ApperIcon name="Calendar" className="h-3 w-3" />
                                {format(new Date(job.date), "MMM dd, yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <ApperIcon name="Clock" className="h-3 w-3" />
                                {format(new Date(job.date), "h:mm a")}
                              </span>
                            </div>
                          </div>
                          <StatusBadge status={job.status} type="job" />
                        </div>
                        {job.notes && (
                          <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                            {job.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No jobs found for this client.</p>
              )}
            </div>
          )}

          {activeTab === "proposals" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ApperIcon name="FileText" className="h-5 w-5" />
                Proposals ({client.proposals?.length || 0})
              </h3>
              {client.proposals?.length > 0 ? (
                <div className="space-y-3">
                  {client.proposals.map((proposal) => (
                    <Card key={proposal.Id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{proposal.title}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <ApperIcon name="Calendar" className="h-3 w-3" />
                                Sent {format(new Date(proposal.dateSent), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <p className="text-lg font-bold text-primary-600">
                              {formatCurrency(proposal.total)}
                            </p>
                          </div>
                          <StatusBadge status={proposal.status} type="proposal" />
                        </div>
                        {proposal.notes && (
                          <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                            {proposal.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No proposals found for this client.</p>
              )}
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ApperIcon name="Receipt" className="h-5 w-5" />
                Invoices ({client.invoices?.length || 0})
              </h3>
              {client.invoices?.length > 0 ? (
                <div className="space-y-3">
                  {client.invoices.map((invoice) => (
                    <Card key={invoice.Id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{invoice.invoiceNumber}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <ApperIcon name="Calendar" className="h-3 w-3" />
                                Issued {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <ApperIcon name="Clock" className="h-3 w-3" />
                                Due {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(invoice.total)}
                            </p>
                          </div>
                          <StatusBadge status={invoice.status} type="invoice" />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Payment Terms: {invoice.paymentTerms}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No invoices found for this client.</p>
              )}
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ApperIcon name="User" className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-sm text-gray-900">{client.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{client.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900">{client.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-sm text-gray-900">{client.address || "No address provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Since</label>
                    <p className="text-sm text-gray-900">
                      {format(new Date(client.createdAt), "MMMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
              {client.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900">{client.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client"
        size="md"
      >
        <ClientForm
          client={client}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default ClientDetail