"use client"
import { Button } from "@/components/ui/button"
import { MapPin} from "lucide-react"
import Image from "next/image"

interface HomeProps {
  content: {
    name: string
    description: string
    location: string
    availability: string
    image: {
      src: string
      alt: string
    }
    socialLinks: {
      github: string
      twitter: string
      dribbble: string
    }
  }
}

export default function HomeComponent({ content }: HomeProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" id="home">
      
      <main className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl font-bold">
              Hi, I&apos;m {content.name}{" "}
              <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              {content.description}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-5 w-5" />
                {content.location}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                {content.availability}
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="text-white border-gray-700" asChild>
                <a href={content.socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              </Button>
              <Button variant="outline" className="text-white border-gray-700" asChild>
                <a href={content.socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
              </Button>
              <Button variant="outline" className="text-white border-gray-700" asChild>
                <a href={content.socialLinks.dribbble} target="_blank" rel="noopener noreferrer">Dribbble</a>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gray-800 rounded-lg transform translate-x-4 translate-y-4" />
              <Image
                alt={content.image.alt}
                className="relative z-10 rounded-lg object-cover w-full h-full"
                src={content.image.src}
                width={400}
                height={500}
                priority
              />
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        .animate-wave {
          animation: wave 1.5s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </div>
  )
}