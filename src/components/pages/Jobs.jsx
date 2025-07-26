import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import SearchBar from "@/components/molecules/SearchBar"
import StatusBadge from "@/components/molecules/StatusBadge"
import DataTable from "@/components/organisms/DataTable"
import Modal from "@/components/organisms/Modal"
import JobForm from "@/components/organisms/JobForm"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { jobService } from "@/services/api/jobService"
import { format } from "date-fns"

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Scheduled", label: "Scheduled" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" }
  ]

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await jobService.getAll()
      setJobs(data)
      setFilteredJobs(data)
    } catch (err) {
      setError("Failed to load jobs. Please try again.")
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
    let filtered = [...jobs]

    if (query.trim()) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.clientName.toLowerCase().includes(query.toLowerCase()) ||
        job.jobType.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (status !== "all") {
      filtered = filtered.filter(job => job.status === status)
    }

    setFilteredJobs(filtered)
  }

  const handleEdit = (job) => {
    setEditingJob(job)
    setIsModalOpen(true)
  }

  const handleDelete = async (job) => {
    if (window.confirm(`Are you sure you want to delete the job "${job.title}"?`)) {
      try {
        await jobService.delete(job.Id)
        toast.success("Job deleted successfully!")
        loadJobs()
      } catch (error) {
        toast.error("Failed to delete job. Please try again.")
      }
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingJob(null)
  }

  const handleFormSubmit = () => {
    handleModalClose()
    loadJobs()
  }

  const columns = [
    {
      key: "title",
      label: "Job Title",
      sortable: true
    },
    {
      key: "clientName",
      label: "Client Name",
      sortable: true
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium">{format(new Date(value), "MMM dd, yyyy")}</div>
          <div className="text-gray-500">{format(new Date(value), "h:mm a")}</div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => <StatusBadge status={value} type="job" />
    },
    {
      key: "jobType",
      label: "Job Type",
      sortable: true
    }
  ]

  if (loading) {
    return <Loading message="Loading jobs..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadJobs} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
            Jobs
          </h1>
          <p className="text-gray-600">
            Manage and track all your cleaning jobs and schedules.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="shrink-0"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          Add New Job
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search jobs by title, client, or type..."
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
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {jobs.filter(job => job.status === "Scheduled").length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="Calendar" className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {jobs.filter(job => job.status === "In Progress").length}
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
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {jobs.filter(job => job.status === "Completed").length}
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
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-primary-600">
                {jobs.length}
              </p>
            </div>
            <div className="p-2 bg-primary-100 rounded-lg">
              <ApperIcon name="Briefcase" className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <Empty
          message="No jobs found"
          description="Get started by scheduling your first cleaning job."
          actionLabel="Add First Job"
          onAction={() => setIsModalOpen(true)}
          icon="Briefcase"
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredJobs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No jobs match your search criteria."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingJob ? "Edit Job" : "Add New Job"}
        size="md"
      >
        <JobForm
          job={editingJob}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}

export default Jobs