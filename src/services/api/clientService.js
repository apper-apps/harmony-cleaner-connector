import clientsData from "@/services/mockData/clients.json";
import prospectsData from "@/services/mockData/prospects.json";
import jobsData from "@/services/mockData/jobs.json";
import proposalsData from "@/services/mockData/proposals.json";
import invoicesData from "@/services/mockData/invoices.json";

let clients = [...clientsData, ...prospectsData]
let jobs = [...jobsData]
let proposals = [...proposalsData]
let invoices = [...invoicesData]
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const clientService = {
async getAll() {
    await delay(300)
    return clients.map(client => ({
      ...client,
      status: client.status || 'client',
      jobCount: jobs.filter(job => job.clientId === client.Id).length,
      proposalCount: proposals.filter(proposal => proposal.clientId === client.Id).length,
      invoiceCount: invoices.filter(invoice => invoice.clientId === client.Id).length
    }))
  },

async getById(id) {
    await delay(200)
    const client = clients.find(c => c.Id === parseInt(id))
    if (!client) return null
    
    const clientJobs = jobs.filter(job => job.clientId === client.Id)
    const clientProposals = proposals.filter(proposal => proposal.clientId === client.Id)
    const clientInvoices = invoices.filter(invoice => invoice.clientId === client.Id)
    
    return {
      ...client,
      status: client.status || 'client',
      jobs: clientJobs,
      proposals: clientProposals,
      invoices: clientInvoices,
      jobCount: clientJobs.length,
      proposalCount: clientProposals.length,
      invoiceCount: clientInvoices.length
    }
},

  async create(clientData) {
    await delay(400)
    const newId = Math.max(...clients.map(c => c.Id), 0) + 1
    const newClient = {
      Id: newId,
      ...clientData,
      status: clientData.status || 'client',
      createdAt: new Date().toISOString()
    }
    clients.push(newClient)
    return {
      ...newClient,
      jobCount: 0,
      proposalCount: 0,
      invoiceCount: 0
    }
  },
// Find client by email address
  async findByEmail(email) {
    await delay(200)
    return clients.find(c => c.email && c.email.toLowerCase() === email.toLowerCase()) || null
  },

  // Alias for legacy compatibility
  async createProspect(clientData) {
    return this.create({ ...clientData, status: 'prospect' })
  },
async update(id, clientData) {
    await delay(350)
    const index = clients.findIndex(c => c.Id === parseInt(id))
    if (index === -1) throw new Error("Client not found")
    
    clients[index] = { ...clients[index], ...clientData }
    return clients[index]
  },

  async delete(id) {
    await delay(250)
    const index = clients.findIndex(c => c.Id === parseInt(id))
    if (index === -1) throw new Error("Client not found")
    
    clients.splice(index, 1)
    return true
  }
}

// Maintain backward compatibility
export default clientService