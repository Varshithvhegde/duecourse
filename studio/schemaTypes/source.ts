import {defineField, defineType} from 'sanity'

/** An official source backing a claim — every agent answer cites these. */
export const source = defineType({
  name: 'source',
  title: 'Source',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'publisher',
      title: 'Publisher',
      type: 'string',
      description: 'e.g. myscheme.gov.in, pmkisan.gov.in, Karnataka e-District',
    }),
    defineField({
      name: 'accessedAt',
      title: 'Accessed on',
      type: 'date',
    }),
  ],
  preview: {
    select: {title: 'title', url: 'url'},
    prepare({title, url}) {
      return {title, subtitle: url}
    },
  },
})
