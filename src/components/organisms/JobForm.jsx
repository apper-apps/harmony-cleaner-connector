import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import { jobService } from "@/services/api/jobService"
import { clientService } from "@/services/api/clientService"
import ApperIcon from "@/components/ApperIcon"

const JobForm = ({ job = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: job?.title || "",
    clientId: job?.clientId || "",
    date: job?.date ? new Date(job.date).toISOString().slice(0, 16) : "",
    status: job?.status || "Scheduled",
    jobType: job?.jobType || "",
    notes: job?.notes || ""
  })
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const statusOptions = ["Scheduled", "In Progress", "Completed"]
  const jobTypeOptions = [
    "Residential Cleaning",
    "Commercial Cleaning",
    "Move-out Cleaning",
    "Construction Cleanup",
    "Deep Cleaning",
    "Regular Maintenance"
  ]

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const clientData = await clientService.getAll()
      setClients(clientData)
    } catch (error) {
      toast.error("Failed to load clients")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required"
    }
    
    if (!formData.clientId) {
      newErrors.clientId = "Client selection is required"
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required"
    }
    
    if (!formData.jobType.trim()) {
      newErrors.jobType = "Job type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const jobData = {
        ...formData,
        clientId: parseInt(formData.clientId),
        date: new Date(formData.date).toISOString()
      }

      if (job) {
        await jobService.update(job.Id, jobData)
        toast.success("Job updated successfully!")
      } else {
        await jobService.create(jobData)
        toast.success("Job created successfully!")
      }
      onSubmit()
    } catch (error) {
      toast.error("Failed to save job. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Job Title"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter job title"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <select
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
            required
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.Id} value={client.Id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="text-sm text-red-600">{errors.clientId}</p>
          )}
        </div>

        <FormField
          label="Scheduled Date & Time"
          id="date"
          name="date"
          type="datetime-local"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">
            Job Type
          </label>
          <select
            id="jobType"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
            required
          >
            <option value="">Select job type</option>
            {jobTypeOptions.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.jobType && (
            <p className="text-sm text-red-600">{errors.jobType}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={handleChange}
          className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
          placeholder="Additional notes about the job..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
              {job ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <ApperIcon name={job ? "Save" : "Plus"} className="h-4 w-4" />
              {job ? "Update Job" : "Create Job"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default JobForm