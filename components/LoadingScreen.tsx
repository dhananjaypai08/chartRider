export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="text-center">
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            {/* Spinning outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600"></div>
            
            {/* Ninja emoji in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-pulse">🥷</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Loading Katana Blocks...
        </h2>
        <p className="text-lg text-gray-600">
          Preparing your blockchain adventure
        </p>
        
        {/* Loading dots animation */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}