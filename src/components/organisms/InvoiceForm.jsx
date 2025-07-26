import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import { invoiceService } from "@/services/api/invoiceService"
import { clientService } from "@/services/api/clientService"
import { jobService } from "@/services/api/jobService"
import ApperIcon from "@/components/ApperIcon"

const InvoiceForm = ({ invoice = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    clientId: invoice?.clientId || "",
    jobId: invoice?.jobId || "",
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : "",
    paymentTerms: invoice?.paymentTerms || "Net 15 days",
    notes: invoice?.notes || "",
    lineItems: invoice?.lineItems || [{ id: 1, service: "", cost: 0 }]
  })
  const [clients, setClients] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const paymentTermsOptions = ["Net 15 days", "Net 30 days", "Due on receipt", "Net 45 days"]

  useEffect(() => {
    loadClients()
    loadJobs()
  }, [])

  const loadClients = async () => {
    try {
      const clientData = await clientService.getAll()
      setClients(clientData)
    } catch (error) {
      toast.error("Failed to load clients")
    }
  }

  const loadJobs = async () => {
    try {
      const jobData = await jobService.getAll()
      setJobs(jobData)
    } catch (error) {
      toast.error("Failed to load jobs")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...formData.lineItems]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "cost" ? parseFloat(value) || 0 : value
    }
    setFormData(prev => ({ ...prev, lineItems: updatedItems }))
  }

  const addLineItem = () => {
    const newId = Math.max(...formData.lineItems.map(item => item.id)) + 1
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: newId, service: "", cost: 0 }]
    }))
  }

  const removeLineItem = (index) => {
    if (formData.lineItems.length > 1) {
      const updatedItems = formData.lineItems.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, lineItems: updatedItems }))
    }
  }

  const calculateTotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + (item.cost || 0), 0)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.clientId) {
      newErrors.clientId = "Client selection is required"
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required"
    }
    
    const hasEmptyService = formData.lineItems.some(item => !item.service.trim())
    if (hasEmptyService) {
      newErrors.lineItems = "All line items must have a service description"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const invoiceData = {
        ...formData,
        clientId: parseInt(formData.clientId),
        jobId: formData.jobId ? parseInt(formData.jobId) : null,
        dueDate: new Date(formData.dueDate).toISOString()
      }

      if (invoice) {
        await invoiceService.update(invoice.Id, invoiceData)
        toast.success("Invoice updated successfully!")
      } else {
        await invoiceService.create(invoiceData)
        toast.success("Invoice created successfully!")
      }
      onSubmit()
    } catch (error) {
      toast.error("Failed to save invoice. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => 
    !formData.clientId || job.clientId === parseInt(formData.clientId)
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="space-y-2">
          <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">
            Linked Job (Optional)
          </label>
          <select
            id="jobId"
            name="jobId"
            value={formData.jobId}
            onChange={handleChange}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
          >
            <option value="">No linked job</option>
            {filteredJobs.map(job => (
              <option key={job.Id} value={job.Id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Due Date"
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
          required
        />

        <div className="space-y-2">
          <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700">
            Payment Terms
          </label>
          <select
            id="paymentTerms"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
          >
            {paymentTermsOptions.map(term => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Line Items
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLineItem}
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            Add Item
          </Button>
        </div>
        
        {errors.lineItems && (
          <p className="text-sm text-red-600">{errors.lineItems}</p>
        )}

        <div className="space-y-3">
          {formData.lineItems.map((item, index) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Service description"
                  value={item.service}
                  onChange={(e) => handleLineItemChange(index, "service", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Cost"
                  step="0.01"
                  min="0"
                  value={item.cost}
                  onChange={(e) => handleLineItemChange(index, "cost", e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
                />
              </div>
              {formData.lineItems.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLineItem(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              ${calculateTotal().toFixed(2)}
            </p>
          </div>
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
          placeholder="Additional notes or payment instructions..."
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
              {invoice ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <ApperIcon name={invoice ? "Save" : "Plus"} className="h-4 w-4" />
              {invoice ? "Update Invoice" : "Create Invoice"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default InvoiceForm