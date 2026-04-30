"use client"

import { useState } from "react"
import Link from "next/link"

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedGuides, setExpandedGuides] = useState<string[]>([])

  const faqs = [
    {
      category: "Commenting",
      questions: [
        { q: "How do I order comment writing?", a: "Go to the dashboard, select Comment Writing service, fill in the details, and submit your order." },
        { q: "What platforms do you support?", a: "We support Instagram, YouTube, Facebook, TikTok, and other major platforms." }
      ]
    },
    {
      category: "AI Humanization",
      questions: [
        { q: "How does AI humanization work?", a: "Our experts review and refine AI-generated content to make it sound natural and engaging." },
        { q: "Can I provide my own AI content?", a: "Yes, upload your content in the order form." }
      ]
    },
    {
      category: "Product Reviews",
      questions: [
        { q: "What makes your reviews authentic?", a: "All reviews are written by real people based on actual product research." },
        { q: "How many reviews can I order?", a: "You can order from 1 to 100+ reviews depending on your needs." }
      ]
    },
    {
      category: "Influencer Research",
      questions: [
        { q: "What information do you provide?", a: "Contact details, engagement rates, audience demographics, and collaboration history." },
        { q: "How current is the data?", a: "We research influencers in real-time for the most up-to-date information." }
      ]
    }
  ]

  const quickStartGuides = [
    {
      title: "Getting Started with Commenting",
      content: "1. Create account\n2. Add credits\n3. Select service\n4. Fill order form\n5. Submit and wait for completion"
    },
    {
      title: "Ordering AI Humanization",
      content: "1. Prepare your AI content\n2. Upload to order form\n3. Specify requirements\n4. Review and submit"
    }
  ]

  const filteredFaqs = faqs.filter(category =>
    category.questions.some(q =>
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const toggleGuide = (title: string) => {
    setExpandedGuides(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="border-b border-[#30363d] bg-[#161b22]">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#e6edf3]">Help Center</h1>
            <Link href="/dashboard" className="text-[#2f81f7] hover:text-[#79c0ff] text-sm">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[#21262d] border border-[#30363d] rounded text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:border-[#2f81f7]"
            />
          </div>

          {/* Quick Start Guides */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
            <h2 className="text-xl font-semibold text-[#e6edf3] mb-4">Quick Start Guides</h2>
            <div className="space-y-4">
              {quickStartGuides.map((guide, index) => (
                <div key={index} className="border border-[#30363d] rounded">
                  <button
                    onClick={() => toggleGuide(guide.title)}
                    className="w-full text-left px-4 py-3 text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                  >
                    {guide.title}
                  </button>
                  {expandedGuides.includes(guide.title) && (
                    <div className="px-4 pb-3 text-[#848d97] whitespace-pre-line">
                      {guide.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Tutorials */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
            <h2 className="text-xl font-semibold text-[#e6edf3] mb-4">Video Tutorials</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="aspect-video bg-[#21262d] rounded flex items-center justify-center">
                <div className="text-center text-[#848d97]">
                  <p className="mb-2">🎥</p>
                  <p className="text-sm">How to Place Your First Order</p>
                  <a href="#" className="text-[#2f81f7] text-xs hover:text-[#79c0ff]">Watch Video</a>
                </div>
              </div>
              <div className="aspect-video bg-[#21262d] rounded flex items-center justify-center">
                <div className="text-center text-[#848d97]">
                  <p className="mb-2">🎥</p>
                  <p className="text-sm">Understanding Credits</p>
                  <a href="#" className="text-[#2f81f7] text-xs hover:text-[#79c0ff]">Watch Video</a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
            <h2 className="text-xl font-semibold text-[#e6edf3] mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {filteredFaqs.map((category, catIndex) => (
                <div key={catIndex}>
                  <h3 className="text-lg font-medium text-[#e6edf3] mb-3">{category.category}</h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, qIndex) => (
                      <details key={qIndex} className="border border-[#30363d] rounded">
                        <summary className="px-4 py-3 text-[#e6edf3] cursor-pointer hover:bg-[#21262d] transition-colors">
                          {faq.q}
                        </summary>
                        <div className="px-4 pb-3 text-[#848d97]">
                          {faq.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
            <h2 className="text-xl font-semibold text-[#e6edf3] mb-4">Feedback & Support</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-[#e6edf3] mb-2">Subject</label>
                <select className="w-full px-3 py-2 bg-[#21262d] border border-[#30363d] rounded text-[#e6edf3] focus:outline-none focus:border-[#2f81f7]">
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>General Question</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#e6edf3] mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 bg-[#21262d] border border-[#30363d] rounded text-[#e6edf3] placeholder-[#848d97] focus:outline-none focus:border-[#2f81f7]"
                  placeholder="Describe your issue or suggestion..."
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-[#2f81f7] hover:bg-[#1f77f0] text-white rounded transition-colors"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}