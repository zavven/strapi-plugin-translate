export const batchContentTypeUid = 'plugin::translate.batch-translate-job'
export const DEFAULT_PRIORITY = 5 // 默认优先级
export const QPS_LIMIT = 50 // 每秒最大请求数
export const MAX_GENERAL_LENGTH = 5000; // translateGeneral API 支持的最大字符串长度
export const MAX_BATCH_COUNT = 50; // getBatchTranslate API 一次最多可翻译的条数
export const MAX_BATCH_TOTAL_LENGTH = 8000; // getBatchTranslate API 一次翻译的最大总字符数
export const MAX_SINGLE_TEXT_LENGTH = 1000; // getBatchTranslate API 单条字符串的最大长度
export const DEFAULT_SPLIT_LENGTH_THRESHOLD = 2000; // 拆分超长字符串时尽量保证的最小长度
