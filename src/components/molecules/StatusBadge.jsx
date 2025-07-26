import Badge from "@/components/atoms/Badge"

const StatusBadge = ({ status, type = "job" }) => {
  const getStatusConfig = () => {
    if (type === "job") {
      switch (status) {
        case "Scheduled":
          return { variant: "info", text: "Scheduled" }
        case "In Progress":
          return { variant: "warning", text: "In Progress" }
        case "Completed":
          return { variant: "success", text: "Completed" }
        default:
          return { variant: "default", text: status }
      }
    }
    
    if (type === "proposal") {
      switch (status) {
        case "Draft":
          return { variant: "default", text: "Draft" }
        case "Sent":
          return { variant: "info", text: "Sent" }
        case "Approved":
          return { variant: "success", text: "Approved" }
        case "Declined":
          return { variant: "danger", text: "Declined" }
        default:
          return { variant: "default", text: status }
      }
    }
    
    if (type === "invoice") {
      switch (status) {
        case "Unpaid":
          return { variant: "warning", text: "Unpaid" }
        case "Paid":
          return { variant: "success", text: "Paid" }
        case "Overdue":
          return { variant: "danger", text: "Overdue" }
        default:
          return { variant: "default", text: status }
      }
    }
    
    return { variant: "default", text: status }
  }

  const { variant, text } = getStatusConfig()

  return <Badge variant={variant}>{text}</Badge>
}

export default StatusBadge