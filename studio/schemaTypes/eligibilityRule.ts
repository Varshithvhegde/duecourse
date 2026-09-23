import {defineField, defineType} from 'sanity'

/**
 * One structured eligibility condition. An agent can reason over these
 * with GROQ instead of parsing legalese — this is what makes the project
 * "only possible with structured content".
 */
export const eligibilityRule = defineType({
  name: 'eligibilityRule',
  title: 'Eligibility rule',
  type: 'object',
  fields: [
    defineField({
      name: 'attribute',
      title: 'Attribute',
      type: 'string',
      options: {
        list: [
          {title: 'Age', value: 'age'},
          {title: 'Annual family income', value: 'income'},
          {title: 'Gender', value: 'gender'},
          {title: 'Occupation', value: 'occupation'},
          {title: 'Social category (SC/ST/OBC/EWS/Minority)', value: 'socialCategory'},
          {title: 'Marital / family status', value: 'familyStatus'},
          {title: 'Disability', value: 'disability'},
          {title: 'Education level', value: 'education'},
          {title: 'Land ownership', value: 'landOwnership'},
          {title: 'Residence (state/district)', value: 'residence'},
          {title: 'BPL / ration card status', value: 'bplStatus'},
          {title: 'Employment sector (formal/informal)', value: 'employmentSector'},
          {title: 'Other', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'operator',
      title: 'Operator',
      type: 'string',
      options: {
        list: [
          {title: 'equals', value: 'eq'},
          {title: 'is one of', value: 'in'},
          {title: 'at least (≥)', value: 'gte'},
          {title: 'at most (≤)', value: 'lte'},
          {title: 'between', value: 'between'},
          {title: 'must have', value: 'has'},
          {title: 'must NOT have', value: 'notHas'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'e.g. "18", "farmer", "250000". For "between": "16-59". For "in": comma-separated.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'plainLanguage',
      title: 'Plain-language phrasing',
      type: 'string',
      description: 'How a person would say it: "You must be a farmer who owns land"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isExclusion',
      title: 'This rule EXCLUDES (disqualifies)',
      type: 'boolean',
      initialValue: false,
      description: 'e.g. "Income tax payers are not eligible"',
    }),
  ],
  preview: {
    select: {plain: 'plainLanguage', exclusion: 'isExclusion'},
    prepare({plain, exclusion}) {
      return {title: plain, subtitle: exclusion ? '⚠ exclusion' : undefined}
    },
  },
})
