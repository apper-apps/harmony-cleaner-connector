import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import { Card } from "@/components/atoms/Card"
import Label from "@/components/atoms/Label"
import ApperIcon from "@/components/ApperIcon"
import { create as createQuote, calculateQuote } from "@/services/api/quoteService"
import { getSurcharges, getDiscounts } from "@/services/api/rateService"
import { clientService } from "@/services/api/clientService"
const QuoteGenerator = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    squareFootage: '',
    serviceFrequency: 'weekly',
    addOns: []
  })
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)
const [surcharges, setSurcharges] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [addOnOptions, setAddOnOptions] = useState([])

useEffect(() => {
    // Load available surcharges and discounts
    const loadedSurcharges = getSurcharges()
    const loadedDiscounts = getDiscounts()
    
    setSurcharges(loadedSurcharges)
    setDiscounts(loadedDiscounts)
    
    // Map surcharges to add-on options with appropriate icons
    const mappedAddOns = loadedSurcharges.map(surcharge => {
      let icon = 'Plus'
      if (surcharge.name.toLowerCase().includes('deep')) icon = 'Sparkles'
      else if (surcharge.name.toLowerCase().includes('pet')) icon = 'Heart'
      else if (surcharge.name.toLowerCase().includes('supplies') || surcharge.name.toLowerCase().includes('supply')) icon = 'ShoppingBag'
      
      return {
        key: surcharge.name.toLowerCase().replace(/\s+/g, ''),
        name: surcharge.name,
        description: surcharge.description,
        icon: icon,
        id: surcharge.Id
      }
    })
    
    setAddOnOptions(mappedAddOns)
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Recalculate quote when relevant fields change
    if (['squareFootage', 'serviceFrequency', 'addOns'].includes(field)) {
      const updatedData = { ...formData, [field]: value }
      if (updatedData.squareFootage) {
        try {
          const newQuote = calculateQuote(updatedData)
          setQuote(newQuote)
        } catch (err) {
          setQuote(null)
        }
      }
    }
  }

const handleAddOnToggle = (addOnKey) => {
    const newAddOns = formData.addOns.includes(addOnKey)
      ? formData.addOns.filter(addon => addon !== addOnKey)
      : [...formData.addOns, addOnKey]
    
    handleInputChange('addOns', newAddOns)
  }

const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.squareFootage || !formData.customerName || !formData.customerEmail) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const quoteData = {
        ...formData,
        squareFootage: parseInt(formData.squareFootage)
      }
      
      // Create quote first
      await createQuote(quoteData)
      
      // Create client prospect
      try {
        const clientData = {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone || '',
          status: 'prospect',
          source: 'quote_generator',
          notes: `Interested in ${formData.serviceFrequency} cleaning service for ${formData.squareFootage} sq ft`
        }
        
        await clientService.create(clientData)
        toast.success('Quote submitted and added to prospects! We\'ll be in touch soon.')
      } catch (clientErr) {
        // Quote was created successfully, but client creation failed
        console.warn('Failed to create client prospect:', clientErr.message)
        toast.success('Quote request submitted successfully! We\'ll be in touch soon.')
      }
      
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        squareFootage: '',
        serviceFrequency: 'weekly',
        addOns: []
      })
      setQuote(null)
    } catch (err) {
      toast.error(`Failed to submit quote: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'oneTime', label: 'One-Time' }
  ]
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
<div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600">
              <ApperIcon name="Sparkles" className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Get Your Quote
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Get Your Cleaning Quote
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tell us about your space and cleaning needs, and we'll provide you with an instant quote 
            for our professional cleaning services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quote Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ApperIcon name="User" size={20} className="text-primary-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email Address *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ApperIcon name="Home" size={20} className="text-primary-600" />
                    Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="squareFootage">Square Footage *</Label>
                      <Input
                        id="squareFootage"
                        type="number"
                        value={formData.squareFootage}
                        onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                        placeholder="e.g., 1200"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceFrequency">Service Frequency</Label>
                      <select
                        id="serviceFrequency"
                        value={formData.serviceFrequency}
                        onChange={(e) => handleInputChange('serviceFrequency', e.target.value)}
                        className="flex h-10 w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        {frequencyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Add-On Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ApperIcon name="Plus" size={20} className="text-primary-600" />
                    Additional Services
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {addOnOptions.map((addOn) => (
                      <div
                        key={addOn.key}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.addOns.includes(addOn.key)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAddOnToggle(addOn.key)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <ApperIcon 
                            name={addOn.icon} 
                            size={20} 
                            className={formData.addOns.includes(addOn.key) ? 'text-primary-600' : 'text-gray-400'} 
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            formData.addOns.includes(addOn.key)
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.addOns.includes(addOn.key) && (
                              <ApperIcon name="Check" size={12} className="text-white" />
                            )}
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{addOn.name}</h4>
                        <p className="text-sm text-gray-600">{addOn.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-lg"
                >
                  {loading ? (
                    <>
                      <ApperIcon name="Loader2" size={20} className="animate-spin" />
                      Submitting Quote...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Send" size={20} />
                      Request Quote
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Quote Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name="Calculator" size={20} className="text-primary-600" />
                Quote Summary
              </h3>
              
              {quote ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium">${quote.basePrice}</span>
                  </div>
                  
                  {quote.surcharges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Add-ons:</span>
                      <span className="font-medium text-green-600">+${quote.surcharges}</span>
                    </div>
                  )}
                  
                  {quote.discounts > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Frequency Discount:</span>
                      <span className="font-medium text-blue-600">-${quote.discounts}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${quote.totalPrice}
                      </span>
                    </div>
                  </div>

                  {formData.serviceFrequency !== 'oneTime' && (
                    <p className="text-sm text-gray-600 text-center mt-2">
                      Per {formData.serviceFrequency} cleaning
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ApperIcon name="Calculator" size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">
                    Enter your square footage to see pricing
                  </p>
                </div>
              )}

            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteGenerator