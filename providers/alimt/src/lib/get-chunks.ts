import {
    MAX_GENERAL_LENGTH,
    MAX_BATCH_COUNT,
    MAX_BATCH_TOTAL_LENGTH,
    MAX_SINGLE_TEXT_LENGTH,
    DEFAULT_SPLIT_LENGTH_THRESHOLD
} from './constants';

/**
 * 判断字符是否为句子结束标点
 * @param text 输入的文本
 * @param index 当前字符的索引
 * @returns 是否为句子结束标点
 */
function isSentenceEnd(text: string, index: number): boolean {
    const char = text[index];
    if (/[，。！？\n]/.test(char)) {
        return true;
    }
    if (/[,\.\!\?]/.test(char)) {
        const nextChar = text[index + 1];
        // 如果后面跟着空格、制表符，则可以拆分
        return /[\s\t]/.test(nextChar);
    }
    return false;
}

/**
 * 根据段落和句子智能拆分超长字符串
 * @param text - 待拆分的超长字符串
 * @returns 拆分后的字符串数组
 */
function splitLongText(text: string, lenThreshold: number = DEFAULT_SPLIT_LENGTH_THRESHOLD): string[] {
    const sentences: string[] = [];
    let currentSentence = '';

    for (let i = 0; i < text.length; i++) {
        currentSentence += text[i];
        if (isSentenceEnd(text, i)) {
            if (currentSentence.length >= lenThreshold) {
                sentences.push(currentSentence);
                currentSentence = '';
            }
        }
    }

    if (currentSentence.length > 0) {
        sentences.push(currentSentence);
    }

    return sentences;
}

export type Chunk = { type: 'general'; index: number; texts: string[] } | { type: 'batch'; items: Record<string, string> };

/**
 * 拆分字符串数组为符合条件的块
 * @param textArray - 待拆分的字符串数组
 * @returns 包含拆分块和还原函数的对象
 */
const getTextChunks = (textArray: string[], options?: { splitLengthThreshold: number }): {
    chunks: Chunk[];
    reduceFunction: (results: (string[] | Record<string, string>)[]) => string[];
} => {
    const chunks: Chunk[] = [];
    let currentBatchChunk: Record<string, string> = {};
    let currentBatchChunkCount = 0;
    let currentBatchChunkTotalLength = 0;

    textArray.forEach((text, index) => {
        if (text.length > MAX_SINGLE_TEXT_LENGTH && text.length <= MAX_GENERAL_LENGTH) {
            // 长度大于 1000 小于等于 5000，使用 translateGeneral
            chunks.push({ type: 'general', index, texts: [text] });
        } else if (text.length > MAX_GENERAL_LENGTH) {
            // 长度大于 5000，拆分后使用 translateGeneral
            const splitTexts = splitLongText(text, options?.splitLengthThreshold);
            chunks.push({ type: 'general', index, texts: splitTexts });
        } else {
            if (
                currentBatchChunkCount === MAX_BATCH_COUNT ||
                currentBatchChunkTotalLength + text.length > MAX_BATCH_TOTAL_LENGTH
            ) {
                chunks.push({ type: 'batch', items: currentBatchChunk });
                currentBatchChunk = {};
                currentBatchChunkCount = 0;
                currentBatchChunkTotalLength = 0;
            }
            currentBatchChunk[index.toString()] = text;
            currentBatchChunkCount++;
            currentBatchChunkTotalLength += text.length;
        }
    });

    if (Object.keys(currentBatchChunk).length > 0) {
        chunks.push({ type: 'batch', items: currentBatchChunk });
    }

    /**
     * 还原拆分后的翻译结果
     * @param results - 翻译结果数组
     * @returns 还原后的字符串数组
     */
    const reduceFunction = (results: (string[] | Record<string, string>)[]): string[] => {
        const result: string[] = new Array(textArray.length).fill('');
        chunks.forEach((chunk, chunkIndex) => {
            const translationResult = results[chunkIndex];
            if (chunk.type === 'general') {
                result[chunk.index] = (translationResult as string[]).join('');
            } else {
                const batchResult = translationResult as Record<string, string>;
                Object.entries(batchResult).forEach(([key, translatedText]) => {
                    const originalIndex = parseInt(key, 10);
                    result[originalIndex] = translatedText;
                });
            }
        });
        return result;
    };

    return { chunks, reduceFunction };
};

export default getTextChunks;
    