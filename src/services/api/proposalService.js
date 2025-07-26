import proposalsData from "@/services/mockData/proposals.json"
import clientsData from "@/services/mockData/clients.json"

let proposals = [...proposalsData]
let clients = [...clientsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const proposalService = {
  async getAll() {
    await delay(300)
    return proposals.map(proposal => {
      const client = clients.find(c => c.Id === proposal.clientId)
      return {
        ...proposal,
        clientName: client?.name || "Unknown Client"
      }
    })
  },

  async getById(id) {
    await delay(200)
    const proposal = proposals.find(p => p.Id === parseInt(id))
    if (!proposal) return null
    
    const client = clients.find(c => c.Id === proposal.clientId)
    return {
      ...proposal,
      clientName: client?.name || "Unknown Client"
    }
  },

  async create(proposalData) {
    await delay(400)
    const newId = Math.max(...proposals.map(p => p.Id)) + 1
    const total = proposalData.lineItems.reduce((sum, item) => sum + item.price, 0)
    const newProposal = {
Id: newId,
      ...proposalData,
      clientId: parseInt(proposalData.clientId), // Ensure clientId is integer
      total,
      dateSent: new Date().toISOString(),
      jobId: null
    }
    proposals.push(newProposal)
    return {
      ...newProposal,
      clientName: clients.find(c => c.Id === newProposal.clientId)?.name || "Unknown Client"
    }
  },

  async update(id, proposalData) {
    await delay(350)
    const index = proposals.findIndex(p => p.Id === parseInt(id))
    if (index === -1) throw new Error("Proposal not found")
    
    const total = proposalData.lineItems?.reduce((sum, item) => sum + item.price, 0) || proposals[index].total
    proposals[index] = { ...proposals[index], ...proposalData, total }
    return proposals[index]
  },

  async delete(id) {
    await delay(250)
    const index = proposals.findIndex(p => p.Id === parseInt(id))
    if (index === -1) throw new Error("Proposal not found")
    
    proposals.splice(index, 1)
    return true
  }
}