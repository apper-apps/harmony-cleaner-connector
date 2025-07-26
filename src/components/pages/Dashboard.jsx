import { useState, useEffect } from "react"
import MetricCard from "@/components/molecules/MetricCard"
import QuickActions from "@/components/organisms/QuickActions"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { jobService } from "@/services/api/jobService"
import { proposalService } from "@/services/api/proposalService"
import { invoiceService } from "@/services/api/invoiceService"
import { clientService } from "@/services/api/clientService"

const Dashboard = () => {
const [data, setData] = useState({
    activeJobs: 0,
    pendingProposals: 0,
    unpaidInvoices: 0,
    recentClients: 0,
    prospects: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

const loadDashboardData = async () => {
    setLoading(true)
    setError("")
    
    try {
      const [jobs, proposals, invoices, clients] = await Promise.all([
        jobService.getAll(),
        proposalService.getAll(),
        invoiceService.getAll(),
        clientService.getAll()
      ])

      const activeJobs = jobs.filter(job => 
        job.status === "Scheduled" || job.status === "In Progress"
      ).length

      const pendingProposals = proposals.filter(proposal => 
        proposal.status === "Sent" || proposal.status === "Draft"
      ).length

      const unpaidInvoices = invoices.filter(invoice => 
        invoice.status === "Unpaid" || invoice.status === "Overdue"
      ).length

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentClients = clients.filter(client => 
        new Date(client.createdAt) > thirtyDaysAgo && client.status === 'client'
      ).length

      const prospects = clients.filter(client => 
        client.status === 'prospect'
      ).length

      setData({
        activeJobs,
        pendingProposals,
        unpaidInvoices,
        recentClients,
        prospects
      })
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading message="Loading dashboard data..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your cleaning business today.
        </p>
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Active Jobs"
          value={data.activeJobs}
          icon="Briefcase"
          color="primary"
          description="Jobs scheduled or in progress"
        />
        <MetricCard
          title="Pending Proposals"
          value={data.pendingProposals}
          icon="FileText"
          color="warning"
          description="Awaiting client response"
        />
        <MetricCard
          title="Unpaid Invoices"
          value={data.unpaidInvoices}
          icon="Receipt"
          color="danger"
          description="Require payment follow-up"
        />
        <MetricCard
          title="Recent Clients Added"
          value={data.recentClients}
          icon="UserPlus"
          color="success"
          description="New clients this month"
        />
        <MetricCard
          title="Active Prospects"
          value={data.prospects}
          icon="Users"
          color="info"
          description="Potential clients in pipeline"
        />
      </div>

      <QuickActions onRefresh={loadDashboardData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary-100 to-primary-200">
              <span className="text-primary-600 text-xl">📊</span>
            </div>
            Business Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Jobs This Month</span>
              <span className="font-semibold text-gray-900">{data.activeJobs + 15}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Revenue This Month</span>
              <span className="font-semibold text-green-600">$8,750</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
</div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Avg. Job Value</span>
              <span className="font-semibold text-gray-900">$185</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200">
              <span className="text-green-600 text-xl">🎯</span>
            </div>
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Clients</span>
              <span className="font-semibold text-gray-900">42</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Completed Jobs</span>
              <span className="font-semibold text-green-600">156</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Revenue YTD</span>
              <span className="font-semibold text-primary-600">$52,400</span>
            </div>
            <div className="flex justify-between items-center py-2">
</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard