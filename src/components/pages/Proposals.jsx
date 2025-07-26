import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import SearchBar from "@/components/molecules/SearchBar"
import StatusBadge from "@/components/molecules/StatusBadge"
import DataTable from "@/components/organisms/DataTable"
import Modal from "@/components/organisms/Modal"
import ProposalForm from "@/components/organisms/ProposalForm"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { proposalService } from "@/services/api/proposalService"
import { format } from "date-fns"

const Proposals = () => {
  const [proposals, setProposals] = useState([])
  const [filteredProposals, setFilteredProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProposal, setEditingProposal] = useState(null)
  const [viewingProposal, setViewingProposal] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Draft", label: "Draft" },
    { value: "Sent", label: "Sent" },
    { value: "Approved", label: "Approved" },
    { value: "Declined", label: "Declined" }
  ]

  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await proposalService.getAll()
      setProposals(data)
      setFilteredProposals(data)
    } catch (err) {
      setError("Failed to load proposals. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    applyFilters(query, statusFilter)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    applyFilters("", status)
  }

  const applyFilters = (query, status) => {
    let filtered = [...proposals]

    if (query.trim()) {
      filtered = filtered.filter(proposal =>
        proposal.title.toLowerCase().includes(query.toLowerCase()) ||
        proposal.clientName.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (status !== "all") {
      filtered = filtered.filter(proposal => proposal.status === status)
    }

    setFilteredProposals(filtered)
  }

  const handleView = (proposal) => {
    setViewingProposal(proposal)
  }

  const handleEdit = (proposal) => {
    setEditingProposal(proposal)
    setIsModalOpen(true)
  }

  const handleDelete = async (proposal) => {
    if (window.confirm(`Are you sure you want to delete the proposal "${proposal.title}"?`)) {
      try {
        await proposalService.delete(proposal.Id)
        toast.success("Proposal deleted successfully!")
        loadProposals()
      } catch (error) {
        toast.error("Failed to delete proposal. Please try again.")
      }
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProposal(null)
  }

  const handleFormSubmit = () => {
    handleModalClose()
    loadProposals()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount)
  }

const columns = [
    {
      key: "title",
      label: "Proposal Title",
      sortable: true
    },
    {
      key: "clientName",
      label: "Client",
      sortable: true
    },
    {
      key: "dateSent",
      label: "Date Sent",
      sortable: true,
      render: (value) => format(new Date(value), "MMM dd, yyyy")
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={value} type="proposal" />
          {row.jobId && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              Job Created
            </span>
          )}
        </div>
      )
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
        </span>
      )
    }
  ]

  if (loading) {
    return <Loading message="Loading proposals..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadProposals} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
            Proposals
          </h1>
          <p className="text-gray-600">
            Create and manage service proposals for your clients.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="shrink-0"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          Create Proposal
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search proposals by title or client..."
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600">
                {proposals.filter(p => p.status === "Draft").length}
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <ApperIcon name="Edit" className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-blue-600">
                {proposals.filter(p => p.status === "Sent").length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="Send" className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {proposals.filter(p => p.status === "Approved").length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(proposals.reduce((sum, p) => sum + p.total, 0))}
              </p>
            </div>
            <div className="p-2 bg-primary-100 rounded-lg">
              <ApperIcon name="DollarSign" className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <Empty
          message="No proposals found"
          description="Get started by creating your first service proposal."
          actionLabel="Create First Proposal"
          onAction={() => setIsModalOpen(true)}
          icon="FileText"
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredProposals}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No proposals match your search criteria."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingProposal ? "Edit Proposal" : "Create Proposal"}
        size="lg"
      >
        <ProposalForm
          proposal={editingProposal}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>

      <Modal
        isOpen={!!viewingProposal}
        onClose={() => setViewingProposal(null)}
        title="Proposal Details"
        size="lg"
      >
        {viewingProposal && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {viewingProposal.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Client: {viewingProposal.clientName}</span>
                  <span>Sent: {format(new Date(viewingProposal.dateSent), "MMM dd, yyyy")}</span>
                </div>
              </div>
              <StatusBadge status={viewingProposal.status} type="proposal" />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Services & Pricing</h4>
              <div className="space-y-3">
                {viewingProposal.lineItems.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-900">{item.service}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(viewingProposal.total)}
                  </span>
                </div>
              </div>
            </div>

            {viewingProposal.notes && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Notes & Terms</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{viewingProposal.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setViewingProposal(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewingProposal(null)
                  handleEdit(viewingProposal)
                }}
              >
                <ApperIcon name="Edit" className="h-4 w-4" />
                Edit Proposal
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Proposals