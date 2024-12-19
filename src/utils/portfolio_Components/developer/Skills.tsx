import Image from "next/image"

interface SkillsProps {
  content: {
    skills: Array<{
      name: string
      icon: string
    }>
  }
}

export default function SkillsComponent({ content }: SkillsProps) {
  return (
    <section className="py-12 bg-[#0a0a0a]" id="skills">
      <div className="container mx-auto px-4">
        <div className="inline-block mb-8 px-4 py-1.5 bg-gray-800 rounded-full text-sm text-white">
          Skills
        </div>
        <h2 className="text-2xl font-bold text-white mb-12">
          The skills, tools and technologies I am really good at:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 md:gap-12">
          {content.skills.map((skill) => (
            <div
              key={skill.name}
              className="flex flex-col items-center justify-center gap-2"
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <Image
                  src={skill.icon}
                  alt={`${skill.name} logo`}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <span className="text-gray-400 text-sm text-center">
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}