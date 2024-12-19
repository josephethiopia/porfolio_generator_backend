import Link from "next/link"
import Image from "next/image"

interface AboutMeProps {
  content: {
    image: {
      src: string
      alt: string
    }
    aboutMe: string
    socialLinks: {
      twitter: string
      github: string
    }
    quickFacts: {
      column1: string[]
      column2: string[]
    }
    outro: string
  }
}

export default function AboutMeComponent({ content }: AboutMeProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" id="about">
      <main className="container mx-auto px-4 py-12">
        <div className="inline-block mb-8 px-4 py-1.5 bg-gray-800 rounded-full text-sm">
          About me
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="relative">
            <div className="relative aspect-[3/4] w-full max-w-md">
              <div className="absolute inset-0 bg-gray-800 rounded-lg transform -translate-x-4 translate-y-4" />
              <Image
                alt={content.image.alt}
                className="relative z-10 rounded-lg object-cover w-full h-full"
                src={content.image.src}
                fill
                priority
              />
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">Curious about me? Here you have it:</h1>
            <p className="text-gray-400">
              {content.aboutMe}{" "}
              You can follow me on{" "}
              <Link href={content.socialLinks.twitter} className="text-white underline">
                Twitter
              </Link>{" "}
              where I share tech-related bites and build in public, or you can follow me on{" "}
              <Link href={content.socialLinks.github} className="text-white underline">
                GitHub
              </Link>
              .
            </p>
            <div className="space-y-4">
              <p className="text-xl font-semibold">Finally, some quick bits about me:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <ul className="list-disc list-inside text-gray-400 space-y-2">
                  {content.quickFacts.column1.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
                <ul className="list-disc list-inside text-gray-400 space-y-2">
                  {content.quickFacts.column2.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-gray-400">
              {content.outro}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}