import {defineField, defineType} from 'sanity'

export const applicationStep = defineType({
  name: 'applicationStep',
  title: 'Application step',
  type: 'object',
  fields: [
    defineField({
      name: 'order',
      title: 'Step #',
      type: 'number',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'channel',
      title: 'Channel',
      type: 'string',
      options: {
        list: [
          {title: 'Online portal', value: 'online'},
          {title: 'Mobile app (UMANG etc.)', value: 'app'},
          {title: 'Common Service Centre (CSC)', value: 'csc'},
          {title: 'Government office', value: 'office'},
          {title: 'Automatic / no application needed', value: 'automatic'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instruction',
      title: 'What to do',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link',
      type: 'url',
    }),
  ],
  preview: {
    select: {order: 'order', channel: 'channel', instruction: 'instruction'},
    prepare({order, channel, instruction}) {
      return {title: `${order}. [${channel}] ${instruction?.slice(0, 60)}`}
    },
  },
})
