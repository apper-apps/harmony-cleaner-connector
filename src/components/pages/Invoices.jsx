import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import SearchBar from "@/components/molecules/SearchBar"
import StatusBadge from "@/components/molecules/StatusBadge"
import DataTable from "@/components/organisms/DataTable"
import Modal from "@/components/organisms/Modal"
import InvoiceForm from "@/components/organisms/InvoiceForm"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { invoiceService } from "@/services/api/invoiceService"
import { format } from "date-fns"

const Invoices = () => {
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Unpaid", label: "Unpaid" },
    { value: "Paid", label: "Paid" },
    { value: "Overdue", label: "Overdue" }
  ]

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await invoiceService.getAll()
      setInvoices(data)
      setFilteredInvoices(data)
    } catch (err) {
      setError("Failed to load invoices. Please try again.")
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
    let filtered = [...invoices]

    if (query.trim()) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(query.toLowerCase()) ||
        (invoice.jobTitle && invoice.jobTitle.toLowerCase().includes(query.toLowerCase()))
      )
    }

    if (status !== "all") {
      filtered = filtered.filter(invoice => invoice.status === status)
    }

    setFilteredInvoices(filtered)
  }

  const handleView = (invoice) => {
    setViewingInvoice(invoice)
  }

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleMarkAsPaid = async (invoice) => {
    if (window.confirm(`Mark invoice ${invoice.invoiceNumber} as paid?`)) {
      try {
        await invoiceService.markAsPaid(invoice.Id)
        toast.success("Invoice marked as paid!")
        loadInvoices()
      } catch (error) {
        toast.error("Failed to update invoice status. Please try again.")
      }
    }
  }

  const handleDelete = async (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      try {
        await invoiceService.delete(invoice.Id)
        toast.success("Invoice deleted successfully!")
        loadInvoices()
      } catch (error) {
        toast.error("Failed to delete invoice. Please try again.")
      }
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingInvoice(null)
  }

  const handleFormSubmit = () => {
    handleModalClose()
    loadInvoices()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount)
  }

  const columns = [
{
      key: "invoiceNumber",
      label: "Invoice Number",
      sortable: true
    },
    {
      key: "clientName",
      label: "Client",
      sortable: true
    },
    {
      key: "jobTitle",
      label: "Job",
      render: (value, row) => (
        <div className="text-sm">
          <div>{value || "No Job"}</div>
          {row.jobId && (
            <div className="text-xs text-blue-600">Job ID: {row.jobId}</div>
          )}
        </div>
      )
    },
    {
      key: "issueDate",
      label: "Issue Date",
      sortable: true,
      render: (value) => format(new Date(value), "MMM dd, yyyy")
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (value) => format(new Date(value), "MMM dd, yyyy")
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={value} type="invoice" />
          {value === "Unpaid" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkAsPaid(row)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <ApperIcon name="CheckCircle" className="h-4 w-4" />
            </Button>
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
    return <Loading message="Loading invoices..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadInvoices} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
            Invoices
          </h1>
          <p className="text-gray-600">
            Generate and track invoices for your cleaning services.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="shrink-0"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search invoices by number, client, or job..."
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
              <p className="text-sm text-gray-600">Unpaid</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter(i => i.status === "Unpaid").length}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ApperIcon name="Clock" className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {invoices.filter(i => i.status === "Overdue").length}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <ApperIcon name="AlertCircle" className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(i => i.status === "Paid").length}
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
                {formatCurrency(invoices.reduce((sum, i) => sum + i.total, 0))}
              </p>
            </div>
            <div className="p-2 bg-primary-100 rounded-lg">
              <ApperIcon name="DollarSign" className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <Empty
          message="No invoices found"
          description="Get started by creating your first invoice for completed work."
          actionLabel="Create First Invoice"
          onAction={() => setIsModalOpen(true)}
          icon="Receipt"
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredInvoices}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No invoices match your search criteria."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingInvoice ? "Edit Invoice" : "Create Invoice"}
        size="lg"
      >
        <InvoiceForm
          invoice={editingInvoice}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>

      <Modal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        title="Invoice Details"
        size="lg"
      >
        {viewingInvoice && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Invoice {viewingInvoice.invoiceNumber}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Client:</span> {viewingInvoice.clientName}
                  </div>
                  <div>
                    <span className="font-medium">Job:</span> {viewingInvoice.jobTitle || "No Job"}
                  </div>
                  <div>
                    <span className="font-medium">Issue Date:</span> {format(new Date(viewingInvoice.issueDate), "MMM dd, yyyy")}
                  </div>
                  <div>
                    <span className="font-medium">Due Date:</span> {format(new Date(viewingInvoice.dueDate), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
              <StatusBadge status={viewingInvoice.status} type="invoice" />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Line Items</h4>
              <div className="space-y-3">
                {viewingInvoice.lineItems.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-900">{item.service}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.cost)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(viewingInvoice.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Payment Terms:</span>
                  <p className="text-gray-900">{viewingInvoice.paymentTerms}</p>
                </div>
              </div>
              {viewingInvoice.notes && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Notes:</span>
                  <div className="bg-gray-50 rounded-lg p-4 mt-2">
                    <p className="text-sm text-gray-700">{viewingInvoice.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setViewingInvoice(null)}
              >
                Close
              </Button>
              {viewingInvoice.status === "Unpaid" && (
                <Button
                  variant="success"
                  onClick={() => {
                    setViewingInvoice(null)
                    handleMarkAsPaid(viewingInvoice)
                  }}
                >
                  <ApperIcon name="CheckCircle" className="h-4 w-4" />
                  Mark as Paid
                </Button>
              )}
              <Button
                onClick={() => {
                  setViewingInvoice(null)
                  handleEdit(viewingInvoice)
                }}
              >
                <ApperIcon name="Edit" className="h-4 w-4" />
                Edit Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Invoices