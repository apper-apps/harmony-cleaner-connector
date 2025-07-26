import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Card from "@/components/atoms/Card"
import Label from "@/components/atoms/Label"
import ApperIcon from "@/components/ApperIcon"
import Modal from "@/components/organisms/Modal"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { getAll, getByCategory, create, update, delete as deleteRate } from "@/services/api/rateService"

const RateManagement = () => {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [editingRate, setEditingRate] = useState(null)
  const [activeCategory, setActiveCategory] = useState('squareFootage')

  useEffect(() => {
    loadRates()
  }, [])

  const loadRates = async () => {
    try {
      setLoading(true)
      const data = getAll()
      setRates(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRate(null)
    setActiveModal('form')
  }

  const handleEdit = (rate) => {
    setEditingRate(rate)
    setActiveModal('form')
  }

  const handleDelete = async (rateId) => {
    try {
      await deleteRate(rateId)
      await loadRates()
      toast.success('Rate deleted successfully')
    } catch (err) {
      toast.error(`Failed to delete rate: ${err.message}`)
    }
  }

  const categories = [
    { id: 'squareFootage', name: 'Square Footage Tiers', icon: 'Home' },
    { id: 'surcharge', name: 'Surcharges', icon: 'Plus' },
    { id: 'discount', name: 'Discounts', icon: 'Percent' }
  ]

  const filteredRates = rates.filter(rate => 
    rate.category === activeCategory && rate.isActive
  )

  if (loading) return <Loading message="Loading rates..." />
  if (error) return <Error message={error} onRetry={loadRates} />

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rate Management</h1>
          <p className="text-gray-600 mt-2">Configure your pricing structure</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Rate
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ApperIcon name={category.icon} size={16} />
            {category.name}
          </button>
        ))}
      </div>

      {/* Rates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRates.map((rate) => (
          <Card key={rate.Id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {rate.name}
                </h3>
                {rate.description && (
                  <p className="text-sm text-gray-600 mb-2">{rate.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(rate)}
                >
                  <ApperIcon name="Edit" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(rate.Id)}
                >
                  <ApperIcon name="Trash2" size={14} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {activeCategory === 'squareFootage' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Range:</span>
                    <span className="text-sm font-medium">
                      {rate.minSqFt}-{rate.maxSqFt === 999999 ? '∞' : rate.maxSqFt} sq ft
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Base Price:</span>
                    <span className="text-lg font-bold text-primary-600">
                      ${rate.basePrice}
                    </span>
                  </div>
                </>
              )}

              {activeCategory === 'surcharge' && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    {rate.surchargeType === 'percentage' 
                      ? `+${rate.surchargeValue}%` 
                      : `+$${rate.surchargeValue}`
                    }
                  </span>
                </div>
              )}

              {activeCategory === 'discount' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frequency:</span>
                    <span className="text-sm font-medium capitalize">
                      {rate.frequency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {rate.discountType === 'percentage' 
                        ? `-${rate.discountValue}%` 
                        : `-$${rate.discountValue}`
                      }
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredRates.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="Settings" size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {categories.find(c => c.id === activeCategory)?.name.toLowerCase()} configured
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first rate configuration
          </p>
          <Button onClick={handleCreate}>
            Add {categories.find(c => c.id === activeCategory)?.name.slice(0, -1)}
          </Button>
        </div>
      )}

      {/* Rate Form Modal */}
      <Modal
        isOpen={activeModal === 'form'}
        onClose={() => setActiveModal(null)}
        title={editingRate ? 'Edit Rate' : 'Add Rate'}
        size="md"
      >
        <RateForm
          rate={editingRate}
          category={activeCategory}
          onSubmit={async (data) => {
            try {
              if (editingRate) {
                await update(editingRate.Id, data)
                toast.success('Rate updated successfully')
              } else {
                await create({ ...data, category: activeCategory })
                toast.success('Rate created successfully')
              }
              await loadRates()
              setActiveModal(null)
            } catch (err) {
              toast.error(`Failed to save rate: ${err.message}`)
            }
          }}
          onCancel={() => setActiveModal(null)}
        />
      </Modal>
    </div>
  )
}

const RateForm = ({ rate, category, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: rate?.name || '',
    description: rate?.description || '',
    minSqFt: rate?.minSqFt || '',
    maxSqFt: rate?.maxSqFt || '',
    basePrice: rate?.basePrice || '',
    surchargeType: rate?.surchargeType || 'fixed',
    surchargeValue: rate?.surchargeValue || '',
    discountType: rate?.discountType || 'percentage',
    discountValue: rate?.discountValue || '',
    frequency: rate?.frequency || 'weekly'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = { ...formData }
    
    // Convert numeric fields
    if (category === 'squareFootage') {
      submitData.minSqFt = parseInt(submitData.minSqFt)
      submitData.maxSqFt = parseInt(submitData.maxSqFt)
      submitData.basePrice = parseFloat(submitData.basePrice)
    } else if (category === 'surcharge') {
      submitData.surchargeValue = parseFloat(submitData.surchargeValue)
    } else if (category === 'discount') {
      submitData.discountValue = parseFloat(submitData.discountValue)
    }
    
    onSubmit(submitData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter rate name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter description"
        />
      </div>

      {category === 'squareFootage' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minSqFt">Min Sq Ft *</Label>
              <Input
                id="minSqFt"
                type="number"
                value={formData.minSqFt}
                onChange={(e) => handleChange('minSqFt', e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="maxSqFt">Max Sq Ft *</Label>
              <Input
                id="maxSqFt"
                type="number"
                value={formData.maxSqFt}
                onChange={(e) => handleChange('maxSqFt', e.target.value)}
                placeholder="999"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="basePrice">Base Price ($) *</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => handleChange('basePrice', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </>
      )}

      {category === 'surcharge' && (
        <>
          <div>
            <Label htmlFor="surchargeType">Surcharge Type *</Label>
            <select
              id="surchargeType"
              value={formData.surchargeType}
              onChange={(e) => handleChange('surchargeType', e.target.value)}
              className="flex h-10 w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            >
              <option value="fixed">Fixed Amount ($)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="surchargeValue">
              Surcharge Value ({formData.surchargeType === 'percentage' ? '%' : '$'}) *
            </Label>
            <Input
              id="surchargeValue"
              type="number"
              step="0.01"
              value={formData.surchargeValue}
              onChange={(e) => handleChange('surchargeValue', e.target.value)}
              placeholder="0"
              required
            />
          </div>
        </>
      )}

      {category === 'discount' && (
        <>
          <div>
            <Label htmlFor="frequency">Service Frequency *</Label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => handleChange('frequency', e.target.value)}
              className="flex h-10 w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <Label htmlFor="discountType">Discount Type *</Label>
            <select
              id="discountType"
              value={formData.discountType}
              onChange={(e) => handleChange('discountType', e.target.value)}
              className="flex h-10 w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="discountValue">
              Discount Value ({formData.discountType === 'percentage' ? '%' : '$'}) *
            </Label>
            <Input
              id="discountValue"
              type="number"
              step="0.01"
              value={formData.discountValue}
              onChange={(e) => handleChange('discountValue', e.target.value)}
              placeholder="0"
              required
            />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {rate ? 'Update Rate' : 'Create Rate'}
        </Button>
      </div>
    </form>
  )
}

export default RateManagement