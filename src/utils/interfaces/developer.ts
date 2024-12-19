export const DeveloperInterface = `{
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
  }`