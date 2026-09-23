import {defineField, defineType} from 'sanity'

/** A document a citizen needs to apply — Aadhaar, ration card, etc. */
export const identityDocument = defineType({
  name: 'identityDocument',
  title: 'Document',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Document name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whereToGet',
      title: 'Where to get it',
      type: 'text',
      rows: 2,
      description: 'e.g. "Any Aadhaar Seva Kendra, free"',
    }),
    defineField({
      name: 'isCommonlyAvailable',
      title: 'Commonly already held',
      type: 'boolean',
      initialValue: false,
      description: 'Aadhaar, bank account — most people have these',
    }),
  ],
  preview: {select: {title: 'name'}},
})
