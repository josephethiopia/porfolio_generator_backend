'use client'

import { Button } from "@/components/ui/button"
import { Copy, Github, Mail, Phone, Twitter } from "lucide-react"
import { useState } from "react"

interface ContactProps {
  content: {
    email: string
    phone: string
    header: string
    socialLinks: {
      [key: string]: string // Allow any social media platform
    }
  }
}

export default function ContactComponent({ content }: ContactProps) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <section className="py-12 bg-[#0a0a0a]" id="contact">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-block mb-8 px-4 py-1.5 bg-gray-800 rounded-full text-sm text-white">
          Get in touch
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          {content.header}
        </h2>
        
        <div className="max-w-2xl mx-auto space-y-6 mt-12">
          <div className="flex items-center justify-center gap-4">
            <Mail className="w-6 h-6 text-gray-400" />
            <a
              href={`mailto:${content.email}`}
              className="text-xl md:text-2xl text-white hover:text-gray-300 transition-colors"
            >
              {content.email}
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={() => handleCopy(content.email, 'email')}
              aria-label="Copy email address"
            >
              <Copy className="w-5 h-5" />
            </Button>
            {copySuccess === 'email' && (
              <span className="absolute mt-8 text-sm text-green-500">Copied!</span>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Phone className="w-6 h-6 text-gray-400" />
            <a
              href={`tel:${content.phone}`}
              className="text-xl md:text-2xl text-white hover:text-gray-300 transition-colors"
            >
              {content.phone}
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={() => handleCopy(content.phone, 'phone')}
              aria-label="Copy phone number"
            >
              <Copy className="w-5 h-5" />
            </Button>
            {copySuccess === 'phone' && (
              <span className="absolute mt-8 text-sm text-green-500">Copied!</span>
            )}
          </div>
        </div>

        <div className="mt-12">
          <p className="text-gray-400 mb-4">You may also find me on these platforms!</p>
          <div className="flex justify-center gap-4">
            {Object.entries(content.socialLinks).map(([platform, url]) => (
              <Button
                key={platform}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                asChild
              >
                <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${platform} Profile`}>
                  {platform === 'github' && <Github className="w-5 h-5" />}
                  {platform === 'twitter' && <Twitter className="w-5 h-5" />}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}