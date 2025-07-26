import invoicesData from "@/services/mockData/invoices.json"
import clientsData from "@/services/mockData/clients.json"
import jobsData from "@/services/mockData/jobs.json"

let invoices = [...invoicesData]
let clients = [...clientsData]
let jobs = [...jobsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const invoiceService = {
  async getAll() {
    await delay(300)
    return invoices.map(invoice => ({
      ...invoice,
      clientName: clients.find(c => c.Id === invoice.clientId)?.name || "Unknown Client",
      jobTitle: invoice.jobId ? jobs.find(j => j.Id === invoice.jobId)?.title || "No Job" : "No Job"
    }))
  },

  async getById(id) {
    await delay(200)
    const invoice = invoices.find(i => i.Id === parseInt(id))
    if (!invoice) return null
    
    const client = clients.find(c => c.Id === invoice.clientId)
    const job = invoice.jobId ? jobs.find(j => j.Id === invoice.jobId) : null
    
    return {
      ...invoice,
      clientName: client?.name || "Unknown Client",
      jobTitle: job?.title || "No Job"
    }
  },

  async create(invoiceData) {
    await delay(400)
    const newId = Math.max(...invoices.map(i => i.Id)) + 1
    const total = invoiceData.lineItems.reduce((sum, item) => sum + item.cost, 0)
    const invoiceNumber = `INV-2024-${String(newId).padStart(3, "0")}`
    
    const newInvoice = {
      Id: newId,
      invoiceNumber,
      ...invoiceData,
      total,
      status: "Unpaid",
      issueDate: new Date().toISOString()
    }
    invoices.push(newInvoice)
    return newInvoice
  },

  async update(id, invoiceData) {
    await delay(350)
    const index = invoices.findIndex(i => i.Id === parseInt(id))
    if (index === -1) throw new Error("Invoice not found")
    
    const total = invoiceData.lineItems?.reduce((sum, item) => sum + item.cost, 0) || invoices[index].total
    invoices[index] = { ...invoices[index], ...invoiceData, total }
    return invoices[index]
  },

  async delete(id) {
    await delay(250)
    const index = invoices.findIndex(i => i.Id === parseInt(id))
    if (index === -1) throw new Error("Invoice not found")
    
    invoices.splice(index, 1)
    return true
  },

  async markAsPaid(id) {
    await delay(200)
    const index = invoices.findIndex(i => i.Id === parseInt(id))
    if (index === -1) throw new Error("Invoice not found")
    
    invoices[index].status = "Paid"
    return invoices[index]
  }
}