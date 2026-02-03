// Leke Leke Follow CTA - Convert landing page visitors to followers

export function LekeLekelCTA() {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-500 p-8 rounded-2xl shadow-2xl mb-8">
      {/* Badge */}
      <div className="inline-block bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
        ⚡ NEW PLATFORM
      </div>
      
      {/* Headline */}
      <h3 className="text-3xl font-bold text-yellow-500 mb-3">
        🎯 Want Daily Tech Intel Like This?
      </h3>
      
      {/* Description */}
      <p className="text-gray-300 text-lg mb-4">
        Join <span className="text-yellow-500 font-bold">100+ African tech builders</span> getting exclusive insights every day on <span className="font-semibold">Leke Leke</span> - Africa's social platform
      </p>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500">37</div>
          <div className="text-xs text-gray-400">Nigerian States</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500">111</div>
          <div className="text-xs text-gray-400">Intel Briefs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500">Daily</div>
          <div className="text-xs text-gray-400">Updates</div>
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a 
          href="https://www.lekeelekee.com/u/amd" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-yellow-500 text-black px-6 py-4 rounded-lg font-bold text-center hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg"
        >
          Follow @amd on Leke Leke →
        </a>
        
        <a 
          href="https://www.lekeelekee.com/groups/2169d52a-171f-4424-a686-d3eb6fbba94" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-gray-800 text-yellow-500 border-2 border-yellow-500 px-6 py-4 rounded-lg font-bold text-center hover:bg-gray-700 transition-all"
        >
          Join Tech Ecosystem Group →
        </a>
      </div>
      
      {/* Social Proof */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔥 Built by Africans, FOR Africans • No Algorithm Suppression
        </p>
      </div>
    </div>
  );
}
