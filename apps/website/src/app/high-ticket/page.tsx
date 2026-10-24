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
            href="tel:+2348180021007"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            📞 Call AMD: +234 818 002 1007
          </a>
        </nav>
      </header>

      {/* Main Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Build a Measurable Growth System
          <br />
          <span className="text-yellow-400">Through Custom AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          We design AI, automation and software systems around measurable business goals, with scope and success criteria agreed before implementation.
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
            <div className="text-4xl font-bold text-yellow-400">Evidence-led</div>
            <div className="text-sm text-gray-400">Delivery Approach</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">Custom</div>
            <div className="text-sm text-gray-400">Systems Designed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">Measured</div>
            <div className="text-sm text-gray-400">Outcome Tracking</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">Direct</div>
            <div className="text-sm text-gray-400">Founder-Led Delivery</div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="bg-black/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Illustrative Solution Patterns
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Case Study 1 */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500">
              <div className="text-green-400 font-bold mb-2">E-COMMERCE</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                E-commerce Growth System
              </h3>
              <p className="text-gray-300 mb-4">
                Example architecture for an online retailer:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>✅ Recommendation and merchandising workflows</li>
                <li>✅ Conversion instrumentation</li>
                <li>✅ Revenue attribution framework</li>
                <li>✅ ROI measured against agreed baseline</li>
              </ul>
            </div>

            {/* Case Study 2 */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500">
              <div className="text-purple-400 font-bold mb-2">FINTECH</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Fintech Processing Automation
              </h3>
              <p className="text-gray-300 mb-4">
                Example automation pattern for payment operations:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>✅ KYC workflow automation</li>
                <li>✅ Fraud-review decision support</li>
                <li>✅ Manual-review cost tracking</li>
                <li>✅ Outcome measurement after deployment</li>
              </ul>
            </div>

            {/* Case Study 3 */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-500">
              <div className="text-yellow-400 font-bold mb-2">REAL ESTATE</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Real-Estate Workflow Automation
              </h3>
              <p className="text-gray-300 mb-4">
                Example workflow architecture for property operations:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>✅ Repeatable workflow automation</li>
                <li>✅ Time-saved measurement</li>
                <li>✅ Cost-savings instrumentation</li>
                <li>✅ ROI measured from verified operating data</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="calculator" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Assess Your Business Case
        </h2>
        <p className="text-xl text-gray-300 text-center mb-12">
          Share your operating context so we can identify where automation or software may create measurable value
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
              Request a Business-Case Review 📊
            </button>

            <p className="text-sm text-gray-400 text-center">
              We'll review your workflow, constraints and baseline data before proposing measurable success criteria.
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
                title: 'Custom Systems Designed',
                price: 'Custom quote',
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
                price: 'Custom quote',
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
                price: 'Custom quote',
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
            Measurement & Delivery Commitment
          </h2>
          <p className="text-xl text-black mb-6">
            We define the baseline, success measures and review cadence before implementation. Any commercial warranty or service commitment is documented in the agreed proposal or contract.
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
            Ready to Build a Measurable Growth System?
          </h2>
          <p className="text-xl text-white mb-8">
            Start with a focused discovery conversation about the business problem, baseline and desired outcome.
          </p>
          <a 
            href="https://amdsolutions007.com/links"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black px-12 py-5 rounded-lg text-2xl font-bold"
          >
            Book Your Free Call Now →
          </a>
          <p className="text-white mt-6">
            Or call/WhatsApp: <a href="tel:+2348180021007" className="underline font-bold">+234 818 002 1007</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 AMD Solutions 007. All rights reserved.</p>
          <p className="mt-2">
            <a href="https://amdsolutions007.com" className="hover:text-white">www.amdsolutions007.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
