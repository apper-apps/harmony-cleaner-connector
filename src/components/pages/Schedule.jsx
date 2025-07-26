import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { jobService } from '@/services/api/jobService'
import Button from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import StatusBadge from '@/components/molecules/StatusBadge'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import { cn } from '@/utils/cn'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns'

const Schedule = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  useEffect(() => {
    loadWeekJobs()
  }, [currentWeek])

  const loadWeekJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
      const data = await jobService.getByWeek(weekStart)
      setJobs(data)
    } catch (err) {
      setError('Failed to load schedule')
      toast.error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1))
  }

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }

  const getJobsForDay = (date) => {
    return jobs.filter(job => isSameDay(new Date(job.date), date))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a')
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadWeekJobs} />

  const weekDays = getWeekDays()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">View upcoming jobs by week</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Job
        </Button>
      </div>

      {/* Week Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Week of {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="p-2"
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="p-2"
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        {/* Week Strip */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {weekDays.map((day, index) => {
            const dayJobs = getJobsForDay(day)
            const isCurrentDay = isToday(day)
            
            return (
              <div
                key={index}
                className={cn(
                  "min-w-[140px] p-4 rounded-lg border transition-all duration-200",
                  isCurrentDay
                    ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm"
                    : "bg-white border-gray-200 hover:shadow-sm"
                )}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <p className={cn(
                      "text-sm font-medium",
                      isCurrentDay ? "text-blue-700" : "text-gray-700"
                    )}>
                      {format(day, 'EEE')}
                    </p>
                    {isCurrentDay && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-lg font-semibold mb-3",
                    isCurrentDay ? "text-blue-800" : "text-gray-900"
                  )}>
                    {format(day, 'd')}
                  </p>
                  
                  {dayJobs.length > 0 ? (
                    <div className="space-y-1">
                      {dayJobs.slice(0, 2).map(job => (
                        <div
                          key={job.Id}
                          className="text-xs p-2 bg-white bg-opacity-80 rounded border border-gray-100"
                        >
                          <p className="font-medium text-gray-800 truncate">{job.title}</p>
                          <p className="text-gray-600">{formatTime(job.date)}</p>
                        </div>
                      ))}
                      {dayJobs.length > 2 && (
                        <p className="text-xs text-gray-500">+{dayJobs.length - 2} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No jobs</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Upcoming Jobs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Jobs This Week</h2>
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map(job => (
              <Card key={job.Id} className="p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                      <ApperIcon name="Briefcase" size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-gray-600 mb-2">{job.clientName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Calendar" size={14} />
                              <span>{format(new Date(job.date), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Clock" size={14} />
                              <span>{formatTime(job.date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-3 py-1 text-xs font-medium rounded-full border",
                            getStatusColor(job.status)
                          )}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                      {job.notes && (
                        <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-3 rounded-lg">
                          {job.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <ApperIcon name="Calendar" size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs scheduled</h3>
            <p className="text-gray-600 mb-4">There are no jobs scheduled for this week.</p>
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Schedule a Job
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Schedule