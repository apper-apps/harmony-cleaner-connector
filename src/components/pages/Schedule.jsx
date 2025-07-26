import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { jobService } from '@/services/api/jobService'
import Button from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import StatusBadge from '@/components/molecules/StatusBadge'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import { cn } from '@/utils/cn'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getMonth, getYear } from 'date-fns'

const Schedule = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewType, setViewType] = useState('week')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (viewType === 'week') {
      loadWeekJobs()
    } else {
      loadMonthJobs()
    }
  }, [currentWeek, currentMonth, viewType])

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

  const loadMonthJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const year = getYear(currentMonth)
      const month = getMonth(currentMonth)
      const data = await jobService.getByMonth(year, month)
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

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
  }

  const handleDayClick = (date, dayJobs) => {
    if (dayJobs.length > 0) {
      // Navigate to the first client's profile for the day
      const firstJob = dayJobs[0]
      if (firstJob.clientId) {
        navigate(`/clients/${firstJob.clientId}`)
        toast.info(`Viewing ${firstJob.clientName}'s profile`)
      }
    }
  }

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }

  const getMonthDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = addDays(calendarStart, 41) // 6 weeks
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
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

  const retryLoad = () => {
    if (viewType === 'week') {
      loadWeekJobs()
    } else {
      loadMonthJobs()
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={retryLoad} />

  const weekDays = getWeekDays()
  const monthDays = getMonthDays()
  return (
<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">
            View upcoming jobs by {viewType === 'week' ? 'week' : 'month'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Type Selector */}
          <div className="relative">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Week View</option>
              <option value="month">Month View</option>
            </select>
            <ApperIcon name="ChevronDown" size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Week View */}
      {viewType === 'week' && (
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
                    "min-w-[140px] p-4 rounded-lg border transition-all duration-200 cursor-pointer",
                    isCurrentDay
                      ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm"
                      : "bg-white border-gray-200 hover:shadow-sm",
                    dayJobs.length > 0 && "hover:border-blue-300"
                  )}
                  onClick={() => handleDayClick(day, dayJobs)}
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
      )}

      {/* Month View */}
      {viewType === 'month' && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="p-2"
              >
                <ApperIcon name="ChevronLeft" size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="p-2"
              >
                <ApperIcon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50 rounded-t">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {monthDays.map((day, index) => {
              const dayJobs = getJobsForDay(day)
              const isCurrentDay = isToday(day)
              const isCurrentMonth = getMonth(day) === getMonth(currentMonth)
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[100px] p-2 border border-gray-200 transition-all duration-200 cursor-pointer hover:bg-gray-50",
                    !isCurrentMonth && "bg-gray-50 text-gray-400",
                    isCurrentDay && isCurrentMonth && "bg-blue-50 border-blue-200",
                    dayJobs.length > 0 && isCurrentMonth && "hover:border-blue-300 hover:shadow-sm"
                  )}
                  onClick={() => isCurrentMonth && handleDayClick(day, dayJobs)}
                >
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        isCurrentDay && isCurrentMonth ? "text-blue-700" : "text-gray-900",
                        !isCurrentMonth && "text-gray-400"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {isCurrentDay && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    
                    {dayJobs.length > 0 && (
                      <div className="flex-1 space-y-1">
                        {dayJobs.slice(0, 3).map(job => (
                          <div
                            key={job.Id}
                            className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                            title={`${job.title} - ${job.clientName} at ${formatTime(job.date)}`}
                          >
                            <div className="font-medium truncate">{job.title}</div>
                            <div className="text-blue-600 truncate">{job.clientName}</div>
                          </div>
                        ))}
                        {dayJobs.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{dayJobs.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
      {/* Upcoming Jobs */}
<div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Jobs This {viewType === 'week' ? 'Week' : 'Month'}
        </h2>
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map(job => (
              <Card 
                key={job.Id} 
                className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer hover:border-blue-300"
                onClick={() => navigate(`/clients/${job.clientId}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                      <ApperIcon name="Briefcase" size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-gray-600 mb-2 hover:text-blue-600 transition-colors">
                            {job.clientName}
                          </p>
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
                          <ApperIcon name="ExternalLink" size={16} className="text-gray-400" />
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
            <p className="text-gray-600 mb-4">
              There are no jobs scheduled for this {viewType === 'week' ? 'week' : 'month'}.
            </p>
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