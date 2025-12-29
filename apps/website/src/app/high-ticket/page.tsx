'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HighTicketLandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    revenue: '',
    challenge: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send to backend or CRM
    console.log('Lead captured:', formData);
    
    // Redirect to booking page
    window.location.href = 'https://amdsolutions007.com/links';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-white">AMD Solutions 007</div>
          <a 
            href="tel:+2349068559191"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            📞 Call Now: 0906 855 9191
          </a>
        </nav>
      </header>

      {/* Main Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Add ₦50M - ₦200M to Your Revenue
          <br />
          <span className="text-yellow-400">Through Custom AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          We build AI systems that generate measurable ROI for Nigerian enterprises.
          Our clients have generated <span className="text-green-400 font-bold">₦2.5B+</span> in additional revenue.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <a 
            href="#calculator"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg text-xl font-bold"
          >
            Calculate Your ROI ↓
          </a>
          <a 
            href="https://amdsolutions007.com/links"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-xl font-bold"
          >
            Book Strategy Call
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-white">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">₦2.5B+</div>
            <div className="text-sm text-gray-400">Revenue Generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">18</div>
            <div className="text-sm text-gray-400">AI Systems</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">4.2x</div>
            <div className="text-sm text-gray-400">Average ROI</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">95%</div>
            <div className="text-sm text-gray-400">Client Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="bg-black/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Real Results from Real Businesses
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Case Study 1 */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500">
              <div className="text-green-400 font-bold mb-2">E-COMMERCE</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                ₦180M Revenue Increase
              </h3>
              <p className="text-gray-300 mb-4">
                Lagos-based online retailer implemented our AI recommendation engine. 
                Results in 6 months:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>✅ 45% increase in average order value</li>
                <li>✅ 38% improvement in conversion rate</li>
                <li>✅ ₦180M additional revenue</li>
                <li>✅ 5.8x ROI</li>
              </ul>
            </div>

            {/* Case Study 2 */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500">
              <div className="text-purple-400 font-bold mb-2">FINTECH</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                75% Faster Processing
              </h3>
              <p className="text-gray-300 mb-4">
                Payment processing company automated KYC and fraud detection:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>✅ 75% reduction in processing time</li>
                <li>✅ 92% fraud detection accuracy</li>
                <li>✅ ₦45M saved in manual review costs</li>
                <li>✅ 3.2x ROI</li>
              </ul>
            </div>

            {/* Case Study 3 */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-500">
              <div className="text-yellow-400 font-bold mb-2">REAL ESTATE</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                80% Workflow Automation
              </h3>
              <p className="text-gray-300 mb-4">
                Property management firm automated operations end-to-end:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>✅ 80% of workflows automated</li>
                <li>✅ 22 hours saved per week</li>
                <li>✅ ₦28M annual savings</li>
                <li>✅ 4.5x ROI</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="calculator" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Calculate Your Potential ROI
        </h2>
        <p className="text-xl text-gray-300 text-center mb-12">
          See how much revenue you could add with AI
        </p>

        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Phone (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Annual Revenue *
              </label>
              <select
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                value={formData.revenue}
                onChange={(e) => setFormData({...formData, revenue: e.target.value})}
              >
                <option value="">Select range</option>
                <option value="50-100M">₦50M - ₦100M</option>
                <option value="100-500M">₦100M - ₦500M</option>
                <option value="500M-1B">₦500M - ₦1B</option>
                <option value="1B+">₦1B+</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Biggest Business Challenge *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600"
                value={formData.challenge}
                onChange={(e) => setFormData({...formData, challenge: e.target.value})}
                placeholder="E.g., Manual data entry taking 20+ hours weekly, poor customer insights, slow processing times..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg text-xl font-bold"
            >
              Get My Custom ROI Report 📊
            </button>

            <p className="text-sm text-gray-400 text-center">
              We'll analyze your business and show you exactly how much revenue you can add with AI.
              No obligation. Free consultation.
            </p>
          </form>
        </div>
      </section>

      {/* Services */}
      <section className="bg-black/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            What We Build
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Custom AI Systems',
                price: '₦2.5M - ₦5M',
                features: [
                  'Predictive analytics',
                  'Natural language AI',
                  'Computer vision',
                  'Recommendation engines',
                  'Fraud detection',
                  'Custom models'
                ]
              },
              {
                title: 'Business Automation',
                price: '₦800K - ₦1.5M',
                features: [
                  'Workflow automation',
                  'Document processing',
                  'Data entry elimination',
                  'Email/SMS automation',
                  'CRM integration',
                  'Reporting automation'
                ]
              },
              {
                title: 'Data Analytics',
                price: '₦1M - ₦2M',
                features: [
                  'Real-time dashboards',
                  'Predictive models',
                  'Customer insights',
                  'Sales forecasting',
                  'Performance tracking',
                  'Custom reports'
                ]
              }
            ].map((service, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                <div className="text-3xl font-bold text-yellow-400 mb-6">{service.price}</div>
                <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                    <li key={i} className="text-gray-300 flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-8 text-center">
          <h2 className="text-4xl font-bold text-black mb-4">
            Our 90-Day ROI Guarantee
          </h2>
          <p className="text-xl text-black mb-6">
            If we don't deliver at least <span className="font-bold">20% efficiency improvement</span> within 90 days, 
            we'll refund 50% of your investment and continue working for free until targets are met.
          </p>
          <p className="text-lg text-black">
            That's how confident we are in our systems.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Add ₦50M+ to Your Revenue?
          </h2>
          <p className="text-xl text-white mb-8">
            Book a free 15-minute strategy call. We'll show you exactly how.
          </p>
          <a 
            href="https://amdsolutions007.com/links"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black px-12 py-5 rounded-lg text-2xl font-bold"
          >
            Book Your Free Call Now →
          </a>
          <p className="text-white mt-6">
            Or call/WhatsApp: <a href="tel:+2349068559191" className="underline font-bold">+234 906 855 9191</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 AMD Solutions 007. All rights reserved.</p>
          <p className="mt-2">
            <a href="https://amdsolutions007.com" className="hover:text-white">www.amdsolutions007.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
