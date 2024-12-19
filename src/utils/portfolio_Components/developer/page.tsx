import AboutMeComponent from './AboutMe'
import ContactComponent from './Contact'
import HomeComponent from './Home'
import SkillsComponent from './Skills'
import WorkComponent from './Work'

interface PageProps {
  content: {
    home: {
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
    aboutMe: {
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
    skills: {
      skills: Array<{
        name: string
        icon: string
      }>
    }
    work: {
      projects: Array<{
        title: string
        description: string
        image: string
        technologies: string[]
      }>
    }
    contact: {
      email: string
      phone: string
      header: string
      socialLinks: {
        [key: string]: string
      }
    }
  }
}

export default function Page({ content }: PageProps) {
  return (
    <div className="bg-[#0a0a0a]">
      <HomeComponent content={content.home} />
      <AboutMeComponent content={content.aboutMe} />
      <SkillsComponent content={content.skills} />
      <WorkComponent content={content.work} />
      <ContactComponent content={content.contact} />
    </div>
  )
}