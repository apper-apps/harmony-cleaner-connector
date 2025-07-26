import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import clientService from "@/services/api/clientService";
import { proposalService } from "@/services/api/proposalService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";

const ProposalForm = ({ proposal = null, onSubmit, onCancel }) => {
  // Counter to ensure unique IDs across all line items
  let itemIdCounter = Date.now();
  
  const defaultData = {
    title: proposal?.title || "",
    clientId: proposal?.clientId || "",
    status: proposal?.status || "Draft",
    notes: proposal?.notes || ""
  };
  
  const [formData, setFormData] = useState({
    ...defaultData,
    lineItems: (proposal?.lineItems || [{ service: "", price: 0 }]).map((item, index) => ({
      ...item,
      id: item.id || `item_${++itemIdCounter}_${index}`
    }))
  });
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const statusOptions = ["Draft", "Sent", "Approved", "Declined"]

  useEffect(() => {
    loadClients()
  }, [])

const loadClients = async () => {
    try {
      const clientData = await clientService.getAll()
      const prospectData = await clientService.getAllProspects()
      
      // Combine clients and prospects for dropdown selection
      const combinedData = [
        ...clientData,
        ...prospectData.map(prospect => ({
          ...prospect,
          isProspect: true
        }))
      ]
      
      setClients(combinedData)
    } catch (error) {
      toast.error("Failed to load clients and prospects")
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
      [field]: field === "price" ? parseFloat(value) || 0 : value
    }
    setFormData(prev => ({ ...prev, lineItems: updatedItems }))
  }
const addLineItem = () => {
    const newId = `item_${++itemIdCounter}`
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: newId, service: "", price: 0 }]
    }))
  }

  const removeLineItem = (index) => {
    if (formData.lineItems.length > 1) {
      const updatedItems = formData.lineItems.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, lineItems: updatedItems }))
    }
  }

  const calculateTotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + (item.price || 0), 0)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "Proposal title is required"
    }
    
    if (!formData.clientId) {
      newErrors.clientId = "Client selection is required"
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
      const proposalData = {
        ...formData,
        clientId: parseInt(formData.clientId)
      }

      if (proposal) {
        await proposalService.update(proposal.Id, proposalData)
        toast.success("Proposal updated successfully!")
      } else {
        await proposalService.create(proposalData)
        toast.success("Proposal created successfully!")
      }
      onSubmit()
    } catch (error) {
      toast.error("Failed to save proposal. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Proposal Title"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter proposal title"
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
{clients.map((client, index) => (
              <option key={client.Id || `client_${index}`} value={client.Id}>
                {client.name}{client.isProspect ? ' (Prospect)' : ''}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="text-sm text-red-600">{errors.clientId}</p>
          )}
        </div>

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
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Services & Pricing
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLineItem}
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            Add Service
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
                  placeholder="Price"
                  step="0.01"
                  min="0"
                  value={item.price}
                  onChange={(e) => handleLineItemChange(index, "price", e.target.value)}
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
          Notes & Terms
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={handleChange}
          className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
          placeholder="Additional notes, terms, or conditions..."
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
              {proposal ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <ApperIcon name={proposal ? "Save" : "Plus"} className="h-4 w-4" />
              {proposal ? "Update Proposal" : "Create Proposal"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default ProposalForm