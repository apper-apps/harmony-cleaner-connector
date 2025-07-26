import quotesData from '@/services/mockData/quotes.json'
import { calculateBasePrice, getSurcharges, getDiscounts } from './rateService'

let quotes = [...quotesData]
let nextId = Math.max(...quotes.map(q => q.Id)) + 1

// Get all quotes
const getAll = () => {
  return [...quotes]
}

// Get quote by ID
const getById = (id) => {
  const numericId = parseInt(id)
  if (isNaN(numericId)) {
    throw new Error('Quote ID must be a valid integer')
  }
  
  const quote = quotes.find(q => q.Id === numericId)
  if (!quote) {
    throw new Error(`Quote with ID ${numericId} not found`)
  }
  
  return { ...quote }
}

// Calculate quote pricing
const calculateQuote = (quoteData) => {
  const { squareFootage, serviceFrequency, addOns = [] } = quoteData
  
  // Get base price
  const basePrice = calculateBasePrice(squareFootage)
  
  // Calculate surcharges
  const surcharges = getSurcharges()
  let totalSurcharges = 0
  
  addOns.forEach(addOn => {
    const surcharge = surcharges.find(s => {
      if (addOn === 'deepCleaning') return s.name === 'Deep Cleaning'
      if (addOn === 'pets') return s.name === 'Pet Hair Cleanup'
      if (addOn === 'supplies') return s.name === 'Cleaning Supplies'
      return false
    })
    
    if (surcharge) {
      if (surcharge.surchargeType === 'percentage') {
        totalSurcharges += (basePrice * surcharge.surchargeValue) / 100
      } else {
        totalSurcharges += surcharge.surchargeValue
      }
    }
  })
  
  // Calculate discounts
  const discounts = getDiscounts()
  let totalDiscounts = 0
  
  const frequencyDiscount = discounts.find(d => d.frequency === serviceFrequency)
  if (frequencyDiscount) {
    const subtotal = basePrice + totalSurcharges
    if (frequencyDiscount.discountType === 'percentage') {
      totalDiscounts = (subtotal * frequencyDiscount.discountValue) / 100
    } else {
      totalDiscounts = frequencyDiscount.discountValue
    }
  }
  
  const totalPrice = Math.max(0, basePrice + totalSurcharges - totalDiscounts)
  
  return {
    basePrice: Math.round(basePrice * 100) / 100,
    surcharges: Math.round(totalSurcharges * 100) / 100,
    discounts: Math.round(totalDiscounts * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100
  }
}

// Create new quote
const create = (quoteData) => {
  const pricing = calculateQuote(quoteData)
  
  const newQuote = {
    ...quoteData,
    ...pricing,
    Id: nextId++,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Validate required fields
  if (!newQuote.customerName || !newQuote.customerEmail || !newQuote.squareFootage) {
    throw new Error('Customer name, email, and square footage are required')
  }
  
  quotes.push(newQuote)
  return { ...newQuote }
}

// Update quote
const update = (id, updateData) => {
  const numericId = parseInt(id)
  if (isNaN(numericId)) {
    throw new Error('Quote ID must be a valid integer')
  }
  
  const index = quotes.findIndex(q => q.Id === numericId)
  if (index === -1) {
    throw new Error(`Quote with ID ${numericId} not found`)
  }
  
  // Recalculate pricing if relevant fields changed
  let updatedQuote = { ...quotes[index], ...updateData }
  
  if (updateData.squareFootage || updateData.serviceFrequency || updateData.addOns) {
    const pricing = calculateQuote(updatedQuote)
    updatedQuote = { ...updatedQuote, ...pricing }
  }
  
  updatedQuote = {
    ...updatedQuote,
    Id: numericId, // Preserve original ID
    updatedAt: new Date().toISOString()
  }
  
  quotes[index] = updatedQuote
  return { ...updatedQuote }
}

// Delete quote
const deleteQuote = (id) => {
  const numericId = parseInt(id)
  if (isNaN(numericId)) {
    throw new Error('Quote ID must be a valid integer')
  }
  
  const index = quotes.findIndex(q => q.Id === numericId)
  if (index === -1) {
    throw new Error(`Quote with ID ${numericId} not found`)
  }
  
  quotes.splice(index, 1)
  return true
}

// Get quotes by status
const getByStatus = (status) => {
  return quotes.filter(quote => quote.status === status)
}

// Get recent quotes
const getRecent = (limit = 10) => {
  return quotes
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export {
  getAll,
  getById,
  create,
  update,
  deleteQuote as delete,
  calculateQuote,
  getByStatus,
  getRecent
}