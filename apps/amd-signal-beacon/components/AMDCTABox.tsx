export default function AMDCTABox() {
  // WhatsApp Group Link - African Tech Ecosystem War Room
  const whatsappGroupLink = "https://chat.whatsapp.com/KmTlNs5TTV69xPNzRkcMZc";

  return (
    <div className="my-16 p-12 border-2 border-[#facc15] rounded-xl bg-gradient-to-br from-[rgba(250,204,21,0.15)] to-[rgba(250,204,21,0.05)] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #facc15 0, #facc15 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="mb-4">
          <span className="text-5xl">🚀</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Join the War Room
        </h2>
        
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Real-time opportunities. Daily Intel Briefs at 8 AM WAT. <br/>
          Connect with builders across 37 Nigerian states.
        </p>

        {/* CTA Button - Styled exactly like links page */}
        <a
          href={whatsappGroupLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#facc15] to-[#eab308] text-black font-bold text-lg rounded-lg shadow-2xl hover:scale-105 transition-transform"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span>Join AMD HQ (WhatsApp Group)</span>
        </a>

        {/* Stats */}
        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-[#facc15] font-bold">127+</span>
            <span>Active Builders</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#facc15] font-bold">37</span>
            <span>Nigerian States</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#facc15] font-bold">Daily</span>
            <span>Intel Briefs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
