import alimt20181012, * as $alimt20181012 from '@alicloud/alimt20181012';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import { Chunk } from './get-chunks';

export type ClientOptions = {
  accessKeyId: string; accessKeySecret: string; endpoint: string;
  region: string;
}

export class Client {
  client: alimt20181012
  constructor(options: ClientOptions) {
    let config = new $OpenApi.Config(options);
    this.client = new alimt20181012(config);
  }

  async translateGeneral(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
    formatType: 'html' | 'text' = 'text'
  ) {
    let translateGeneralRequest = new $alimt20181012.TranslateGeneralRequest({
      sourceText,
      sourceLanguage,
      targetLanguage,
      formatType,
      scene: 'general',
    });
    try {
      const res = await this.client.translateGeneral(translateGeneralRequest);
      if (res.statusCode !== 200 || !res.body || !res.body.data || !res.body.data.translated) {
        return sourceText;
      }
      return res.body.data.translated;
    } catch (error) {
      console.error(error);
      return sourceText;
    }   
  }

  async getBatchTranslate(
    sourceText: Record<string, string>,
    sourceLanguage: string,
    targetLanguage: string,
    formatType: 'html' | 'text' = 'text'
  ) {
    let translateGeneralRequest = new $alimt20181012.GetBatchTranslateRequest({
      sourceText: JSON.stringify(sourceText),
      sourceLanguage,
      targetLanguage,
      formatType,
      scene: 'general',
      // FIXME: This should be configurable
      apiType: 'translate_standard',
    });
    try {
      const res = await this.client.getBatchTranslate(translateGeneralRequest);
      if (res.statusCode !== 200 || !res.body || !res.body.translatedList) {
        return sourceText;
      }
      const translated: Record<string, string> = res.body.translatedList.reduce((acc, item) => {
        acc[item.index] = item.translated || '';
        return acc;
      }, {});
      return translated;
    } catch (error) {
      console.error(error);
      return sourceText;
    }   
  }

  async translateChunk(
    chunk: Chunk,
    sourceLanguage: string,
    targetLanguage: string,
    formatType: 'html' | 'text' = 'text',
  ) {
    let res: string[] | Record<string, string>;
    if (chunk.type === 'batch') {
      res = await this.getBatchTranslate(chunk.items, sourceLanguage, targetLanguage, formatType);
    } else {
      res = await Promise.all(chunk.texts.map(text => this.translateGeneral(text, sourceLanguage, targetLanguage, formatType)));
    }
    return res;
  }
}
