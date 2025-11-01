export default function LoadingScreen() {
  // Subtle colors sampled from katana-banner.png
  // Example palette: #f8fafc (light gray), #e5e7eb (gray), #facc15 (yellow accent)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="mb-8 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#facc15] bg-[#e5e7eb] shadow-md"></div>
        </div>
        <h2 className="text-2xl font-bold text-[#334155] mb-2">Loading Katana Blocks...</h2>
        <p className="text-[#64748b]">Preparing your blockchain adventure</p>
      </div>
    </div>
  );
}