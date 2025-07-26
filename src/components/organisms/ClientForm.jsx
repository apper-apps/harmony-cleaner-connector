import { useState } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import { clientService } from "@/services/api/clientService"
import ApperIcon from "@/components/ApperIcon"

const ClientForm = ({ client = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    notes: client?.notes || "",
    status: client?.status || "client"
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      if (client) {
        await clientService.update(client.Id, formData)
        toast.success("Client updated successfully!")
      } else {
        await clientService.create(formData)
        toast.success("Client created successfully!")
      }
      onSubmit()
    } catch (error) {
      toast.error("Failed to save client. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Client Name"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter client name"
          required
        />
        
        <FormField
          label="Phone Number"
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="(555) 123-4567"
          required
        />
</div>

      <FormField
        label="Email Address"
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="client@example.com"
        required
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="client"
              checked={formData.status === 'client'}
              onChange={handleChange}
              className="mr-2 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Client</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="prospect"
              checked={formData.status === 'prospect'}
              onChange={handleChange}
              className="mr-2 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Prospect</span>
          </label>
        </div>
      </div>

      <FormField
        label="Address"
        id="address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        placeholder="123 Main St, City, State 12345"
      />
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
          placeholder="Additional notes about the client..."
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
              {client ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <ApperIcon name={client ? "Save" : "Plus"} className="h-4 w-4" />
              {client ? "Update Client" : "Create Client"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default ClientForm