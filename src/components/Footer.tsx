import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const coreValues = [
    "Human-Powered",
    "No Automation",
    "Real Conversations 💬",
    "Authentic Engagement",
    "Transparent Proof"
  ]

  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/share/1GpPhrtVS9/" },
    { name: "Twitter", href: "https://x.com/opulflow_inc" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/opulflow/" },
    { name: "Instagram", href: "https://www.instagram.com/opulflow_inc?igsh=MXZsbmdwOGZuY2Zyeg==" },
    { name: "TikTok", href: "https://www.tiktok.com/@opulflow_inc?_r=1&_t=ZS-95xx7QnSbY8" },
    { name: "Reddit", href: "https://www.reddit.com/u/opulflow_inc/s/cymmxDCfVl" },
    { name: "Discord", href: "https://discord.gg/TCWMH3RC8" }
  ]

  return (
    <footer className="bg-[#161b22] border-t border-[#30363d] text-[#848d97]">
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Copyright */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-2">OpulFlow</h3>
              <p className="text-xs text-[#848d97]">
                © {currentYear} OpulFlow. All rights reserved.
              </p>
            </div>
          </div>

          {/* Column 2: Contact */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-2">Contact</h3>
              <div className="space-y-1 text-xs">
                <p>
                  <a
                    href="mailto:opulflow.inc@gmail.com"
                    className="text-[#848d97] hover:text-[#2f81f7] transition-colors"
                  >
                    opulflow.inc@gmail.com
                  </a>
                </p>
                <p>
                  <a
                    href="tel:+254790282363"
                    className="text-[#848d97] hover:text-[#2f81f7] transition-colors"
                  >
                    +254 790 282363
                  </a>
                </p>
                <p className="text-[#848d97]">Mon-Sat, 7AM-5PM EAT</p>
              </div>
            </div>
          </div>

          {/* Column 3: Legal & Help */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-2">Legal</h3>
              <div className="space-y-1 text-xs">
                <Link
                  href="/privacy"
                  className="block text-[#848d97] hover:text-[#2f81f7] transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="block text-[#848d97] hover:text-[#2f81f7] transition-colors"
                >
                  Terms & Conditions
                </Link>
                <Link
                  href="/refund"
                  className="block text-[#848d97] hover:text-[#2f81f7] transition-colors"
                >
                  Refund Policy
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-2">Help</h3>
              <div className="space-y-1 text-xs">
                <Link
                  href="/help"
                  className="block text-[#848d97] hover:text-[#2f81f7] transition-colors"
                >
                  Help Center
                </Link>
                <Link
                  href="mailto:opulflow.inc@gmail.com"
                  className="block text-[#848d97] hover:text-[#2f81f7] transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          {/* Column 4: Core Values & Social */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-2">Core Values</h3>
              <div className="flex flex-wrap gap-1">
                {coreValues.map((value, index) => (
                  <span
                    key={index}
                    className="inline-block bg-[#21262d] text-[#e6edf3] text-xs px-2 py-1 rounded border border-[#30363d]"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#e6edf3] mb-2">Follow Us</h3>
              <p className="text-xs text-[#848d97] mb-3">Stay updated and share your feedback</p>
              <div className="grid grid-cols-2 gap-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#848d97] hover:text-[#2f81f7] transition-colors text-sm font-medium bg-[#21262d] hover:bg-[#30363d] px-3 py-2 rounded border border-[#30363d] hover:border-[#2f81f7] text-center"
                    title={`Follow us on ${social.name}`}
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Baruch Hashem Adonai - Optional duplicate */}
        <div className="text-center mt-8 pt-8 border-t border-[#30363d]">
          <p className="text-xs text-[#848d97]">Baruch Hashem Adonai</p>
        </div>
      </div>
    </footer>
  )
}
