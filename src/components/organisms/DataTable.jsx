import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onView,
  emptyMessage = "No data available",
  className 
}) => {
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnKey)
      setSortDirection("asc")
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <ApperIcon name="Database" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:bg-gray-100 transition-colors"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <ApperIcon 
                        name={sortColumn === column.key 
                          ? (sortDirection === "asc" ? "ChevronUp" : "ChevronDown")
                          : "ChevronsUpDown"
                        }
                        className="h-4 w-4"
                      />
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
{sortedData.map((row, index) => {
              // Generate truly unique key to prevent React warning about duplicate keys
              const uniqueKey = row.Id ? `${row.Id}-${index}` : 
                                row.id ? `${row.id}-${index}` :
                                row.invoiceNumber ? `inv-${row.invoiceNumber}-${index}` :
                                row.name ? `name-${row.name}-${index}` :
                                row.title ? `title-${row.title}-${index}` :
                                `row-${index}-${Object.keys(row).length}`;
              
              return (
                <tr 
                  key={uniqueKey}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(row)}
                        >
                          <ApperIcon name="Eye" className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(row)}
                        >
                          <ApperIcon name="Edit" className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4" />
                        </Button>
                      )}
</div>
                  </td>
)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable