import jobsData from "@/services/mockData/jobs.json"
import clientsData from "@/services/mockData/clients.json"

let jobs = [...jobsData]
let clients = [...clientsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const jobService = {
  async getAll() {
    await delay(300)
    return jobs.map(job => ({
      ...job,
      clientName: clients.find(c => c.Id === job.clientId)?.name || "Unknown Client"
    }))
  },

  async getById(id) {
    await delay(200)
    const job = jobs.find(j => j.Id === parseInt(id))
    if (!job) return null
    
    const client = clients.find(c => c.Id === job.clientId)
    return {
      ...job,
      clientName: client?.name || "Unknown Client"
    }
  },

  async create(jobData) {
    await delay(400)
    const newId = Math.max(...jobs.map(j => j.Id)) + 1
    const newJob = {
      Id: newId,
      ...jobData,
      proposalId: null,
      invoiceId: null
    }
    jobs.push(newJob)
    return newJob
  },

  async update(id, jobData) {
    await delay(350)
    const index = jobs.findIndex(j => j.Id === parseInt(id))
    if (index === -1) throw new Error("Job not found")
    
    jobs[index] = { ...jobs[index], ...jobData }
    return jobs[index]
  },

  async delete(id) {
    await delay(250)
    const index = jobs.findIndex(j => j.Id === parseInt(id))
    if (index === -1) throw new Error("Job not found")
    
    jobs.splice(index, 1)
    return true
  },

async getByMonth(year, month) {
    await delay(200)
    return jobs.filter(job => {
      const jobDate = new Date(job.date)
      return jobDate.getFullYear() === year && jobDate.getMonth() === month
    }).map(job => ({
      ...job,
      clientName: clients.find(c => c.Id === job.clientId)?.name || "Unknown Client"
    }))
  },

  async getByWeek(weekStart) {
    await delay(200)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    return jobs.filter(job => {
      const jobDate = new Date(job.date)
      return jobDate >= weekStart && jobDate <= weekEnd
    }).map(job => ({
      ...job,
      clientName: clients.find(c => c.Id === job.clientId)?.name || "Unknown Client"
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
  }
}