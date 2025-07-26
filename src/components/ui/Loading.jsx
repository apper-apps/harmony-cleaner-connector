const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-primary-300 rounded-full animate-spin animation-delay-150"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-600 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
        {message}
      </p>
    </div>
  )
}

export default Loading