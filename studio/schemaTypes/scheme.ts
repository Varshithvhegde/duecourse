import {defineField, defineType} from 'sanity'

export const scheme = defineType({
  name: 'scheme',
  title: 'Scheme',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Scheme name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortTitle',
      title: 'Short title / acronym',
      type: 'string',
      description: 'e.g. PM-KISAN, Gruha Lakshmi',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: Record<string, unknown>) =>
          (doc.shortTitle as string) || (doc.name as string) || '',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: {list: ['Central', 'State'], layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      description: 'Only for State-level schemes',
      hidden: ({document}) => document?.level !== 'State',
    }),
    defineField({
      name: 'ministry',
      title: 'Ministry / Department',
      type: 'string',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          'Agriculture',
          'Education',
          'Health',
          'Housing',
          'Social Welfare',
          'Women & Child',
          'Skills & Employment',
          'Banking & Insurance',
          'Business & Entrepreneurship',
          'Utility & Sanitation',
        ],
      },
    }),
    defineField({
      name: 'brief',
      title: 'One-line summary',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      of: [{type: 'block'}],
      description: 'What the beneficiary actually gets — amounts, frequency, in-kind goods',
    }),
    defineField({
      name: 'benefitAmountAnnual',
      title: 'Approx. annual benefit (₹)',
      type: 'number',
      description: 'Best-effort estimate so the agent can total up "what you are owed"',
    }),
    defineField({
      name: 'eligibility',
      title: 'Eligibility rules',
      type: 'array',
      of: [{type: 'eligibilityRule'}],
      description: 'Structured, queryable rules — the heart of the dataset',
    }),
    defineField({
      name: 'eligibilityNotes',
      title: 'Eligibility notes (verbatim)',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Official eligibility text, kept for citation alongside the structured rules',
    }),
    defineField({
      name: 'documentsRequired',
      title: 'Documents required',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'identityDocument'}]}],
    }),
    defineField({
      name: 'applicationSteps',
      title: 'How to apply',
      type: 'array',
      of: [{type: 'applicationStep'}],
    }),
    defineField({
      name: 'sources',
      title: 'Official sources',
      type: 'array',
      of: [{type: 'source'}],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'lastVerified',
      title: 'Last verified',
      type: 'date',
      description: 'When a human last checked this against the official source',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Closed', value: 'closed'},
          {title: 'Superseded', value: 'superseded'},
        ],
        layout: 'radio',
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'supersededBy',
      title: 'Superseded by',
      type: 'reference',
      to: [{type: 'scheme'}],
      hidden: ({document}) => document?.status !== 'superseded',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'shortTitle', level: 'level', state: 'state'},
    prepare({title, subtitle, level, state}) {
      return {
        title,
        subtitle: [subtitle, level === 'State' ? state : level].filter(Boolean).join(' · '),
      }
    },
  },
})
