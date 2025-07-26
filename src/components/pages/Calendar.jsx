import { useState, useEffect } from "react"
import Button from "@/components/atoms/Button"
import { Card, CardContent } from "@/components/atoms/Card"
import StatusBadge from "@/components/molecules/StatusBadge"
import Modal from "@/components/organisms/Modal"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { jobService } from "@/services/api/jobService"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedJob, setSelectedJob] = useState(null)

  useEffect(() => {
    loadJobs()
  }, [currentDate])

  const loadJobs = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await jobService.getByMonth(
        currentDate.getFullYear(),
        currentDate.getMonth()
      )
      setJobs(data)
    } catch (err) {
      setError("Failed to load calendar data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleJobClick = (job) => {
    setSelectedJob(job)
  }

  const getJobsForDay = (date) => {
    return jobs.filter(job => isSameDay(new Date(job.date), date))
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (loading) {
    return <Loading message="Loading calendar..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadJobs} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
            Calendar
          </h1>
          <p className="text-gray-600">
            View and manage your scheduled cleaning jobs.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
              >
                <ApperIcon name="ChevronLeft" className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
              >
                <ApperIcon name="ChevronRight" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center font-semibold text-gray-700">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => {
              const dayJobs = getJobsForDay(day)
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-2 border rounded-lg transition-colors ${
                    isCurrentMonth 
                      ? "bg-white border-gray-200 hover:bg-gray-50" 
                      : "bg-gray-50 border-gray-100 text-gray-400"
                  } ${isToday ? "ring-2 ring-primary-500 bg-primary-50" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? "text-primary-700" : "text-gray-900"
                  }`}>
                    {format(day, "d")}
                  </div>
                  
                  <div className="space-y-1">
                    {dayJobs.slice(0, 3).map(job => (
                      <button
                        key={job.Id}
                        onClick={() => handleJobClick(job)}
                        className="w-full text-left p-1 text-xs rounded bg-primary-100 hover:bg-primary-200 text-primary-800 transition-colors"
                      >
                        <div className="font-medium truncate">{job.title}</div>
                        <div className="text-[10px] opacity-75">{job.clientName}</div>
                      </button>
                    ))}
                    {dayJobs.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{dayJobs.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-primary-600">
                {jobs.length}
              </p>
            </div>
            <div className="p-2 bg-primary-100 rounded-lg">
              <ApperIcon name="Calendar" className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {jobs.filter(job => job.status === "Scheduled").length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="Clock" className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {jobs.filter(job => job.status === "Completed").length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {jobs.length === 0 && (
        <Empty
          message="No jobs scheduled this month"
          description="Schedule your first cleaning job to see it on the calendar."
          actionLabel="Add Job"
          onAction={() => {}}
          icon="Calendar"
        />
      )}

      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title="Job Details"
        size="md"
      >
        {selectedJob && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedJob.title}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="User" className="h-4 w-4" />
                    <span>{selectedJob.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Calendar" className="h-4 w-4" />
                    <span>{format(new Date(selectedJob.date), "EEEE, MMMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Clock" className="h-4 w-4" />
                    <span>{format(new Date(selectedJob.date), "h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Briefcase" className="h-4 w-4" />
                    <span>{selectedJob.jobType}</span>
                  </div>
                </div>
              </div>
              <StatusBadge status={selectedJob.status} type="job" />
            </div>

            {selectedJob.notes && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{selectedJob.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </Button>
              <Button onClick={() => setSelectedJob(null)}>
                <ApperIcon name="ExternalLink" className="h-4 w-4" />
                View Job Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Calendar