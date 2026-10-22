import governanceData from '@/data/location-governance.json'
import wave3Data from '@/data/location-wave-3.json'
import wave4Data from '@/data/location-wave-4.json'

export type LocationFaq = { question: string; answer: string }
export type LocationRecord = {
  slug: string; displayName: string; title: string; description: string; h1: string; summary: string;
  market: string[]; centres: string[]; services: string[]; journey: string[]; faq: LocationFaq[]; evidence: string[]
}
export type LocationGovernance = {
  relatedLocations: string[]; evidenceReviewedAt: string; contentOwner: string; demandConfidence: string; lastValidatedAt: string
}

const baseLocations: LocationRecord[] = [
  {
    "slug": "nigeria",
    "displayName": "Nigeria",
    "title": "Nigeria Business Websites, AI Automation & Software | AMD Solutions 007",
    "description": "Business websites, AI automation and software systems for organisations across Nigeria, delivered through AMD Solutions 007 from Lagos.",
    "h1": "Business Websites, AI Automation and Software Development Across Nigeria",
    "summary": "AMD Solutions 007 helps Nigerian organisations replace fragmented digital activity with owned websites, automation and software that support discovery, enquiries and operations.",
    "market": [
      "Nigeria-wide delivery works best when a business has one clear digital foundation instead of disconnected social pages and manual hand-offs."
    ],
    "centres": [
      "Lagos operating base",
      "Abuja/FCT",
      "Port Harcourt",
      "Ibadan",
      "Kano",
      "Enugu"
    ],
    "services": [
      "Professional business websites",
      "AI and workflow automation",
      "Custom software and portals",
      "WhatsApp automation"
    ],
    "journey": [
      "Clarify the business problem and customer journey.",
      "Build the smallest useful digital system.",
      "Connect enquiry, follow-up and operating workflows.",
      "Measure usage before expanding scope."
    ],
    "faq": [
      {
        "question": "Do you work with businesses across Nigeria?",
        "answer": "Yes. AMD delivers remotely across Nigeria from Ibeju-Lekki, Lagos and can arrange client-site activity where appropriate."
      },
      {
        "question": "Is this a directory of AMD offices?",
        "answer": "No. It describes service coverage and does not claim branches in every state."
      }
    ],
    "evidence": [
      "AMD Nigeria Location Network Audit",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "lagos",
    "displayName": "Lagos",
    "title": "Lagos Business Websites, AI Automation & Software | AMD Solutions 007",
    "description": "Business websites, automation and software systems for Lagos organisations, with AMD operating from Ibeju-Lekki and client-site work by appointment.",
    "h1": "Business Websites, AI Automation and Software Development in Lagos",
    "summary": "Lagos is AMD Solutions 007’s genuine operating base. We support businesses that need stronger websites, automation, customer workflows and software.",
    "market": [
      "Lagos combines dense SME activity, professional services, commerce and fast-moving customer expectations."
    ],
    "centres": [
      "Ibeju-Lekki",
      "Lekki axis",
      "Lagos Island",
      "Victoria Island",
      "Ikeja"
    ],
    "services": [
      "Business websites",
      "WhatsApp automation",
      "AI-assisted workflows",
      "Custom software"
    ],
    "journey": [
      "Audit the current customer journey.",
      "Prioritise the highest-friction digital step.",
      "Implement and validate the working flow.",
      "Support measured iteration."
    ],
    "faq": [
      {
        "question": "Where is AMD Solutions 007 based?",
        "answer": "AMD operates from Ibeju-Lekki, Lagos. Client-site work may be arranged by appointment; this is not a public walk-in office."
      },
      {
        "question": "Can you support Lagos SMEs remotely?",
        "answer": "Yes. Most delivery can be completed remotely."
      }
    ],
    "evidence": [
      "AMD operating-base evidence",
      "Wave 1 certified location-network evidence"
    ]
  },
  {
    "slug": "abuja",
    "displayName": "Abuja",
    "title": "Abuja Websites, Automation & Software Development | AMD Solutions 007",
    "description": "Websites, automation and software systems for Abuja organisations that need clearer service presentation, enquiry workflows and operational tools.",
    "h1": "Websites, Automation and Software Development for Abuja Organisations",
    "summary": "Abuja organisations often need clearer capability presentation, qualified enquiries and reliable operating workflows.",
    "market": [
      "Abuja’s institutional, professional-service and supplier environment rewards structured enquiry and dependable follow-up."
    ],
    "centres": [
      "Central Abuja",
      "Gwarinpa",
      "Wuse",
      "Maitama",
      "Garki"
    ],
    "services": [
      "Capability websites",
      "Client portals",
      "Lead qualification",
      "Workflow automation"
    ],
    "journey": [
      "Present services and credentials clearly.",
      "Capture the right enquiry details.",
      "Route requests to the correct owner.",
      "Track follow-up and hand-off."
    ],
    "faq": [
      {
        "question": "Does AMD have an Abuja office?",
        "answer": "No. AMD serves Abuja remotely from its Ibeju-Lekki, Lagos operating base."
      },
      {
        "question": "Can supplier enquiries be structured?",
        "answer": "Yes. Qualification forms and workflow automation can replace unstructured message chains."
      }
    ],
    "evidence": [
      "Wave 1 Abuja market research",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "port-harcourt",
    "displayName": "Port Harcourt",
    "title": "Port Harcourt Business Websites & Automation | AMD Solutions 007",
    "description": "Websites and automation for Port Harcourt companies that need stronger capability presentation, enquiries, vendor workflows and customer follow-up.",
    "h1": "Business Websites and Automation for Port Harcourt Companies",
    "summary": "Port Harcourt businesses often need to turn technical capability and project experience into a customer journey buyers can understand quickly.",
    "market": [
      "Energy-service, engineering and professional-service businesses benefit from stronger capability pages and quotation intake."
    ],
    "centres": [
      "Port Harcourt",
      "Trans Amadi",
      "Rumuola",
      "GRA",
      "Onne-linked market"
    ],
    "services": [
      "Capability websites",
      "Quotation workflows",
      "WhatsApp automation",
      "B2B portals"
    ],
    "journey": [
      "Clarify capability and buyer questions.",
      "Package service information.",
      "Capture project enquiries.",
      "Route follow-up into workflow."
    ],
    "faq": [
      {
        "question": "Does AMD have a Port Harcourt branch?",
        "answer": "No. AMD serves Port Harcourt remotely from Ibeju-Lekki, Lagos."
      },
      {
        "question": "Can quotation requests be automated?",
        "answer": "Yes, when qualification and routing rules are defined."
      }
    ],
    "evidence": [
      "Wave 1 Port Harcourt research",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "ibadan",
    "displayName": "Ibadan",
    "title": "Ibadan SME Websites & Business Automation | AMD Solutions 007",
    "description": "Websites and business automation for Ibadan SMEs that need stronger discovery, lead capture, service information and customer follow-up.",
    "h1": "Websites and Business Automation for Ibadan SMEs",
    "summary": "Ibadan SMEs can gain more from a simple owned customer journey than from adding more disconnected social accounts.",
    "market": [
      "The city’s broad SME and professional-service base creates practical website and workflow use cases."
    ],
    "centres": [
      "Ibadan North",
      "Ring Road",
      "Bodija",
      "Challenge",
      "Oluyole"
    ],
    "services": [
      "SME websites",
      "Local SEO support",
      "WhatsApp automation",
      "Customer intake workflows"
    ],
    "journey": [
      "Make the offer understandable.",
      "Create an owned enquiry path.",
      "Capture useful customer information.",
      "Standardise follow-up."
    ],
    "faq": [
      {
        "question": "Does AMD have an Ibadan office?",
        "answer": "No. AMD serves Ibadan remotely from Ibeju-Lekki, Lagos."
      },
      {
        "question": "Can you help an SME that mainly sells through WhatsApp?",
        "answer": "Yes. A website can organise the offer while WhatsApp remains a conversion channel."
      }
    ],
    "evidence": [
      "Wave 1 Ibadan research",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "kano",
    "displayName": "Kano",
    "title": "Kano Digital Commerce, Websites & Automation | AMD Solutions 007",
    "description": "Digital commerce, websites and automation for Kano businesses managing product discovery, trade enquiries, catalogues and customer follow-up.",
    "h1": "Digital Commerce, Websites and Automation for Kano Businesses",
    "summary": "Kano’s commerce and distribution environment creates a clear need for product visibility and trade-enquiry qualification.",
    "market": [
      "Wholesale, distribution and manufacturing businesses often need better product information and enquiry routing."
    ],
    "centres": [
      "Kano metropolis",
      "Bompai",
      "Sabon Gari",
      "Sharada"
    ],
    "services": [
      "Digital catalogues",
      "B2B websites",
      "Order workflows",
      "WhatsApp automation"
    ],
    "journey": [
      "Organise products and buyer information.",
      "Capture trade enquiries.",
      "Route orders and quotation requests.",
      "Support fulfilment communication."
    ],
    "faq": [
      {
        "question": "Does AMD operate a Kano branch?",
        "answer": "No. AMD serves Kano remotely from Ibeju-Lekki, Lagos."
      },
      {
        "question": "Can you create a digital catalogue without full e-commerce?",
        "answer": "Yes. Many B2B businesses benefit from catalogue and enquiry routing."
      }
    ],
    "evidence": [
      "Wave 1 Kano research",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "enugu",
    "displayName": "Enugu",
    "title": "Enugu Business Websites, AI Automation & Software | AMD Solutions 007",
    "description": "Business websites, AI automation and software for Enugu companies that need stronger discovery, enquiries, customer systems and internal workflows.",
    "h1": "Websites, AI Automation and Software for Enugu Businesses",
    "summary": "Enugu businesses can turn referrals and social discovery into clearer service information and qualified enquiries.",
    "market": [
      "Professional services, commerce, education and hospitality support practical website and workflow use cases."
    ],
    "centres": [
      "Enugu metropolis",
      "Independence Layout",
      "GRA",
      "New Haven"
    ],
    "services": [
      "Business websites",
      "AI-assisted workflow tools",
      "WhatsApp automation",
      "Customer portals"
    ],
    "journey": [
      "Translate the offer into useful information.",
      "Capture enquiries with context.",
      "Automate repeatable follow-up.",
      "Add software where process depth requires it."
    ],
    "faq": [
      {
        "question": "Does AMD have an Enugu team?",
        "answer": "No. AMD serves Enugu remotely from Ibeju-Lekki, Lagos."
      },
      {
        "question": "Can you combine a website with AI automation?",
        "answer": "Yes, where AI safely assists a defined task."
      }
    ],
    "evidence": [
      "Wave 1 Enugu research",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "ogun",
    "displayName": "Ogun",
    "title": "Ogun Industrial Websites, Automation & Software | AMD Solutions 007",
    "description": "Websites, automation and software for Ogun businesses across industrial, manufacturing, logistics and service markets, delivered remotely from Lagos.",
    "h1": "Websites, Automation and Software for Ogun State Businesses",
    "summary": "Ogun’s industrial corridors make supplier credibility, product information and quotation handling especially important.",
    "market": [
      "Manufacturing, logistics and supplier businesses benefit from capability sites and process automation."
    ],
    "centres": [
      "Abeokuta",
      "Ota",
      "Agbara",
      "Sagamu",
      "Ibafo/Mowe"
    ],
    "services": [
      "Industrial capability websites",
      "B2B catalogues",
      "Quotation workflows",
      "Operational software"
    ],
    "journey": [
      "Present capability and product information.",
      "Qualify buyer enquiries.",
      "Route quotations.",
      "Track operating hand-off."
    ],
    "faq": [
      {
        "question": "Does AMD have an Ogun branch?",
        "answer": "No. AMD serves Ogun remotely from Ibeju-Lekki, Lagos."
      },
      {
        "question": "Can you build a website for a manufacturer?",
        "answer": "Yes. It can structure products, capability and enquiry paths."
      }
    ],
    "evidence": [
      "Wave 2 Ogun research",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "anambra",
    "displayName": "Anambra",
    "title": "Anambra Digital Commerce, Websites & Software | AMD Solutions 007",
    "description": "Digital commerce, websites and software for Anambra businesses handling wholesale, distribution, product information and customer/order workflows.",
    "h1": "Digital Commerce, Websites and Software for Anambra Businesses",
    "summary": "Anambra’s commercial and distribution activity creates strong use cases for organised product information and wholesale qualification.",
    "market": [
      "Trading, manufacturing and distribution businesses can use digital catalogues to complement referral networks."
    ],
    "centres": [
      "Awka",
      "Onitsha",
      "Nnewi",
      "Ekwulobia-linked market"
    ],
    "services": [
      "Wholesale catalogues",
      "Commerce websites",
      "Order workflows",
      "Custom business software"
    ],
    "journey": [
      "Structure products and buyer types.",
      "Make information searchable.",
      "Capture and qualify orders.",
      "Track fulfilment."
    ],
    "faq": [
      {
        "question": "Does AMD have an Anambra office?",
        "answer": "No. AMD serves Anambra remotely from Ibeju-Lekki, Lagos."
      },
      {
        "question": "Do we need full e-commerce checkout?",
        "answer": "Not always. Many B2B businesses benefit more from structured order intake."
      }
    ],
    "evidence": [
      "Wave 2 Anambra research",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "kaduna",
    "displayName": "Kaduna",
    "title": "Kaduna Agribusiness Automation & Software | AMD Solutions 007",
    "description": "Websites, agribusiness automation and software for Kaduna businesses managing suppliers, products, field activity, enquiries and workflows.",
    "h1": "Websites, Agribusiness Automation and Software for Kaduna",
    "summary": "Kaduna’s agriculture and processing activity supports digital systems connecting product visibility with supplier and field workflows.",
    "market": [
      "Agribusiness operators may need supplier intake, field reporting and customer communication in one coherent system."
    ],
    "centres": [
      "Kaduna metropolis",
      "Zaria",
      "Kafanchan-linked markets",
      "industrial areas"
    ],
    "services": [
      "Agribusiness websites",
      "Supplier workflows",
      "Field data systems",
      "Business automation"
    ],
    "journey": [
      "Map supplier and customer information.",
      "Create product visibility.",
      "Digitise repetitive field steps.",
      "Review operational data."
    ],
    "faq": [
      {
        "question": "Does AMD have a Kaduna branch?",
        "answer": "No. AMD serves Kaduna remotely from Ibeju-Lekki, Lagos."
      },
      {
        "question": "Can field teams use the system?",
        "answer": "Yes, when mobile access and connectivity assumptions are realistic."
      }
    ],
    "evidence": [
      "Wave 2 Kaduna research",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "akwa-ibom",
    "displayName": "Akwa Ibom",
    "title": "Akwa Ibom Customer Automation & Websites | AMD Solutions 007",
    "description": "Websites, customer automation and software for Akwa Ibom hospitality, service, commerce and project businesses, delivered remotely from Lagos.",
    "h1": "Websites, Customer Automation and Software for Akwa Ibom",
    "summary": "Akwa Ibom’s hospitality and service economy creates practical customer-journey needs around discovery, enquiry and follow-up.",
    "market": [
      "Hospitality, professional services and commerce benefit from owned websites and structured customer workflows."
    ],
    "centres": [
      "Uyo",
      "Eket",
      "Ikot Ekpene",
      "Oron-linked markets"
    ],
    "services": [
      "Customer-focused websites",
      "Booking flows",
      "WhatsApp automation",
      "Project portals"
    ],
    "journey": [
      "Make the service discoverable.",
      "Capture enquiry context.",
      "Confirm and route requests.",
      "Maintain follow-up."
    ],
    "faq": [
      {
        "question": "Does AMD have an Akwa Ibom office?",
        "answer": "No. AMD serves Akwa Ibom remotely from Ibeju-Lekki, Lagos."
      },
      {
        "question": "Can you support hospitality enquiries?",
        "answer": "Yes. Websites and WhatsApp follow-up can be combined around the guest journey."
      }
    ],
    "evidence": [
      "Wave 2 Akwa Ibom research",
      "Wave 1–3 certified location-network evidence"
    ]
  },
  {
    "slug": "bauchi",
    "displayName": "Bauchi",
    "title": "Bauchi Agribusiness & Tourism Digital Systems | AMD Solutions 007",
    "description": "Agribusiness websites, tourism systems and automation for Bauchi organisations managing visitor, supplier, product and operational workflows.",
    "h1": "Websites, Agribusiness Systems and Tourism Automation for Bauchi",
    "summary": "Bauchi has a differentiated mix of agriculture, tourism and service activity, creating digital needs around product information and visitor enquiries.",
    "market": [
      "Tourism operators and agribusinesses can use clear websites, enquiry systems and supplier workflows."
    ],
    "centres": [
      "Bauchi metropolis",
      "Azare-linked market",
      "tourism corridors",
      "agricultural markets"
    ],
    "services": [
      "Tourism websites",
      "Agribusiness systems",
      "Enquiry automation",
      "Workflow software"
    ],
    "journey": [
      "Clarify visitor or buyer information.",
      "Create a usable discovery layer.",
      "Capture requests with context.",
      "Automate repeatable coordination."
    ],
    "faq": [
      {
        "question": "Does AMD have a Bauchi branch?",
        "answer": "No. AMD serves Bauchi remotely from Ibeju-Lekki, Lagos."
      },
      {
        "question": "Can agribusiness workflows be digitised?",
        "answer": "Yes, where the supplier or field process is defined."
      }
    ],
    "evidence": [
      "Wave 2 Bauchi research",
      "Wave 1–3 certified location-network evidence"
    ]
  }
]
const governance = governanceData as Record<string, LocationGovernance>
const records: LocationRecord[] = [...baseLocations, ...(wave3Data as LocationRecord[]), ...(wave4Data as LocationRecord[])]
export const locationRecords = records.map((record) => ({ ...record, governance: governance[record.slug] }))
export type GovernedLocation = (typeof locationRecords)[number]
export const locationBySlug = new Map(locationRecords.map((record) => [record.slug, record]))
export function getLocation(slug: string) { return locationBySlug.get(slug) }
export function getLocationDisplayName(slug: string) { return locationBySlug.get(slug)?.displayName ?? slug }
export const locationSlugs = locationRecords.map((record) => record.slug)
export const wave4Slugs = ['nasarawa','ondo','cross-river','imo','osun'] as const
export const canonicalWhatsApp = 'https://wa.me/2348180021007'
export const canonicalTelephone = '+2348180021007'
export const canonicalOrigin = 'https://www.amdsolutions007.com'
