import { DeveloperInterface } from '../interfaces/developer.js'

export const developerPrompt = (data: any) => `I want to generate a formatted JSON data for a developer portfolio website. Please use the following data as reference and format it according to the specified interface.

Input Data:
${JSON.stringify(data, null, 2)}

Interface Definition:
${DeveloperInterface}

Please generate a valid JSON object that follows this interface structure using the input data provided above.`