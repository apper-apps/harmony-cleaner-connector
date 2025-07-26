import ratesData from '@/services/mockData/rates.json'

let rates = [...ratesData]
let nextId = Math.max(...rates.map(r => r.Id)) + 1

// Get all rates
const getAll = () => {
  return [...rates]
}

// Get rates by category
const getByCategory = (category) => {
  return rates.filter(rate => rate.category === category && rate.isActive)
}

// Get square footage tiers
const getSquareFootageTiers = () => {
  return rates
    .filter(rate => rate.category === 'squareFootage' && rate.isActive)
    .sort((a, b) => a.minSqFt - b.minSqFt)
}

// Get surcharges
const getSurcharges = () => {
  return rates.filter(rate => rate.category === 'surcharge' && rate.isActive)
}

// Get discounts
const getDiscounts = () => {
  return rates.filter(rate => rate.category === 'discount' && rate.isActive)
}

// Get rate by ID
const getById = (id) => {
  const numericId = parseInt(id)
  if (isNaN(numericId)) {
    throw new Error('Rate ID must be a valid integer')
  }
  
  const rate = rates.find(r => r.Id === numericId)
  if (!rate) {
    throw new Error(`Rate with ID ${numericId} not found`)
  }
  
  return { ...rate }
}

// Create new rate
const create = (rateData) => {
  const newRate = {
    ...rateData,
    Id: nextId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
  
  // Validate required fields based on category
  if (newRate.category === 'squareFootage') {
    if (!newRate.minSqFt || !newRate.maxSqFt || !newRate.basePrice) {
      throw new Error('Square footage rates require minSqFt, maxSqFt, and basePrice')
    }
  } else if (newRate.category === 'surcharge') {
    if (!newRate.surchargeType || !newRate.surchargeValue) {
      throw new Error('Surcharges require surchargeType and surchargeValue')
    }
  } else if (newRate.category === 'discount') {
    if (!newRate.discountType || !newRate.discountValue || !newRate.frequency) {
      throw new Error('Discounts require discountType, discountValue, and frequency')
    }
  }
  
  rates.push(newRate)
  return { ...newRate }
}

// Update rate
const update = (id, updateData) => {
  const numericId = parseInt(id)
  if (isNaN(numericId)) {
    throw new Error('Rate ID must be a valid integer')
  }
  
  const index = rates.findIndex(r => r.Id === numericId)
  if (index === -1) {
    throw new Error(`Rate with ID ${numericId} not found`)
  }
  
  const updatedRate = {
    ...rates[index],
    ...updateData,
    Id: numericId, // Preserve original ID
    updatedAt: new Date().toISOString()
  }
  
  rates[index] = updatedRate
  return { ...updatedRate }
}

// Delete rate (soft delete by setting isActive to false)
const deleteRate = (id) => {
  const numericId = parseInt(id)
  if (isNaN(numericId)) {
    throw new Error('Rate ID must be a valid integer')
  }
  
  const index = rates.findIndex(r => r.Id === numericId)
  if (index === -1) {
    throw new Error(`Rate with ID ${numericId} not found`)
  }
  
  rates[index] = {
    ...rates[index],
    isActive: false,
    updatedAt: new Date().toISOString()
  }
  
  return true
}

// Calculate base price for square footage
const calculateBasePrice = (squareFootage) => {
  const tiers = getSquareFootageTiers()
  const tier = tiers.find(t => squareFootage >= t.minSqFt && squareFootage <= t.maxSqFt)
  return tier ? tier.basePrice : 0
}

export {
  getAll,
  getByCategory,
  getSquareFootageTiers,
  getSurcharges,
  getDiscounts,
  getById,
  create,
  update,
  deleteRate as delete,
  calculateBasePrice
}