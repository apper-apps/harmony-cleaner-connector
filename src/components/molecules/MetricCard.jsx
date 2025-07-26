import { Card, CardContent } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"

const MetricCard = ({ title, value, icon, color = "primary", trend, description }) => {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600",
    success: "from-green-500 to-green-600",
    warning: "from-yellow-500 to-yellow-600",
    danger: "from-red-500 to-red-600",
    info: "from-blue-500 to-blue-600"
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
                {value}
              </p>
              {trend && (
                <span className={`text-sm font-medium ${
                  trend.type === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {trend.value}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} bg-opacity-10`}>
            <ApperIcon 
              name={icon} 
              className={`h-6 w-6 bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MetricCard