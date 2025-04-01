import Bottleneck from 'bottleneck'

import { DEFAULT_PRIORITY, QPS_LIMIT, DEFAULT_SPLIT_LENGTH_THRESHOLD, MAX_GENERAL_LENGTH } from './constants'
import { Client } from './client'
import { getService } from './get-service'
import { TranslateProvider } from 'strapi-plugin-translate/dist/shared'
import getTextChunks from './get-chunks'

/**
 * Module dependencies
 */
const provider: TranslateProvider = {
  provider: 'alimt',
  name: 'alimt',

  init(providerOptions: any = {}) {
    const accessKeyId = process.env.ALIMT_ACCESS_KEY_ID || providerOptions.accessKeyId
    const accessKeySecret = process.env.ALIMT_ACCESS_KEY_SECRET || providerOptions.accessKeySecret
    const endpoint = process.env.ALIMT_ENDPOINT || providerOptions.endpoint
    const region = process.env.ALIMT_REGION || providerOptions.region
    const splitLengthThreshold = Number(process.env.ALIMT_SPLIT_LENGTH_THRESHOLD) || providerOptions.splitLengthThreshold || DEFAULT_SPLIT_LENGTH_THRESHOLD;

    if (!accessKeyId || !accessKeySecret || !endpoint || !region) {
      throw new Error('Missing required configuration for alimt provider: accessKeyId, accessKeySecret, endpoint, region')
    }

    if (splitLengthThreshold < 1 || splitLengthThreshold > MAX_GENERAL_LENGTH) {
      throw new Error(`splitLengthThreshold should be between 1 and ${MAX_GENERAL_LENGTH}`)
    }

    const client = new Client({ accessKeyId, accessKeySecret, endpoint, region })

    const localeMap = typeof providerOptions.localeMap === 'object' ? providerOptions.localeMap : {}

    

    const limiter = new Bottleneck({ minTime: 1000 / QPS_LIMIT, maxConcurrent: 1 })

    type TranslateChunk = typeof client.translateChunk

    const rateLimitedTranslate = limiter.wrap<
      (string[] | Record<string, string>),
      Parameters<TranslateChunk>[0],
      Parameters<TranslateChunk>[1],
      Parameters<TranslateChunk>[2],
      Parameters<TranslateChunk>[3]
    >(client.translateChunk.bind(client))

    return {
      async translate({ text, priority, sourceLocale, targetLocale, format }) {
        if (!text) {
          return []
        }
        if (!sourceLocale || !targetLocale) {
          throw new Error('source and target locale must be defined')
        }

        const source = localeMap[sourceLocale] ?? sourceLocale
        const target = localeMap[targetLocale] ?? targetLocale

        const formatService = getService('format')

        let input: string | string[]
        if (typeof text === 'string' || typeof text[0] === 'string') {
          input = text as string | string[]
        } else {
          if (format === 'jsonb') {
            input = await formatService.blockToHtml(
              text as Parameters<typeof formatService.blockToHtml>[0]
            )
          } else {
            throw new Error(
              `Unsupported format ${format} with non text/text-array input ${typeof text} `
            )
          }
        }
        if (format === 'markdown') {
          input = formatService.markdownToHtml(input)
        }

        const textArray = Array.isArray(input) ? input : [input]

        const { chunks, reduceFunction } = getTextChunks(textArray, { splitLengthThreshold })

        const result = reduceFunction(
          await Promise.all(
            chunks.map((chunk) => {
              return rateLimitedTranslate.withOptions(
                { priority: typeof priority === 'number' ? priority : DEFAULT_PRIORITY },
                chunk,
                source,
                target,
                ['html', 'markdown', 'jsonb'].includes(format || '') ? 'html' : 'text'
              )
            })
          )
        )

        if (format === 'jsonb') {
          return formatService.htmlToBlock(result)
        }
        if (format === 'markdown') {
          return formatService.htmlToMarkdown(result)
        }

        return result
      },
    }
  },
}

export default provider
