import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import SearchBar from "@/components/molecules/SearchBar"
import DataTable from "@/components/organisms/DataTable"
import Modal from "@/components/organisms/Modal"
import ClientForm from "@/components/organisms/ClientForm"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { clientService } from "@/services/api/clientService"

const Clients = () => {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await clientService.getAll()
      setClients(data)
      setFilteredClients(data)
    } catch (err) {
      setError("Failed to load clients. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredClients(clients)
      return
    }

    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(query.toLowerCase()) ||
      client.email.toLowerCase().includes(query.toLowerCase()) ||
      client.phone.includes(query)
    )
    setFilteredClients(filtered)
  }

  const handleView = (client) => {
    navigate(`/clients/${client.Id}`)
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = async (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      try {
        await clientService.delete(client.Id)
        toast.success("Client deleted successfully!")
        loadClients()
      } catch (error) {
        toast.error("Failed to delete client. Please try again.")
      }
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingClient(null)
  }

  const handleFormSubmit = () => {
    handleModalClose()
    loadClients()
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true
    },
    {
      key: "email",
      label: "Email",
      sortable: true
    },
    {
      key: "address",
      label: "Address",
      render: (value) => value || "No address provided"
    },
    {
      key: "jobCount",
      label: "# of Jobs",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {value}
        </span>
      )
    },
    {
      key: "invoiceCount",
      label: "# of Invoices",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value}
        </span>
      )
    }
  ]

  if (loading) {
    return <Loading message="Loading clients..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadClients} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
            Clients
          </h1>
          <p className="text-gray-600">
            Manage your client relationships and contact information.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="shrink-0"
        >
          <ApperIcon name="UserPlus" className="h-4 w-4" />
          Add New Client
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search clients by name, email, or phone..."
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <Empty
          message="No clients found"
          description="Get started by adding your first client to begin managing your business relationships."
          actionLabel="Add First Client"
          onAction={() => setIsModalOpen(true)}
          icon="Users"
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredClients}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No clients match your search criteria."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingClient ? "Edit Client" : "Add New Client"}
        size="md"
      >
        <ClientForm
          client={editingClient}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}

export default Clients