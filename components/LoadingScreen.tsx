export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b9aed] via-[#0474d7] via-[#053b9a] to-[#0c1a43]">
      <div className="text-center">
        <div className="mb-7 flex items-center justify-center">
          <div className="relative">
            {/* Spinning outer ring */}
            <div className="absolute inset-0 rounded-full border-3 border-white/10"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-3 border-b-3 border-[#F4FF00]"></div>
            
            {/* Ninja emoji in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl animate-pulse">🥷</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-light text-white mb-2 tracking-tight">
          loading katana blocks...
        </h2>
        <p className="text-sm text-white/65 font-light tracking-wide">
          preparing your blockchain adventure
        </p>
        
        {/* Loading dots animation */}
        <div className="flex justify-center gap-1.5 mt-5">
          <div className="w-2 h-2 bg-[#F4FF00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#F4FF00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#F4FF00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}