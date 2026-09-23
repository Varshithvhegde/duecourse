import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'duecourse',
  title: 'DueCourse — Indian Welfare Schemes',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'qldtw72y',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()],
  schema: {types: schemaTypes},
})
