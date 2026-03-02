import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private agent: HttpsProxyAgent<string>;
  private groq: Groq;

  constructor(private readonly configService: ConfigService) {
    const proxyUser = this.configService.getOrThrow<string>('PROXY_USER');
    const proxyPassword =
      this.configService.getOrThrow<string>('PROXY_PASSWORD');
    const proxyUrl = this.configService.getOrThrow<string>('PROXY_URL');
    const apiKey = this.configService.getOrThrow<string>('GROQ_API_KEY');

    const cleanUrl = proxyUrl.replace(/^"|"$/g, '');
    const urlObj = new URL(cleanUrl);

    this.agent = new HttpsProxyAgent(
      `http://${proxyUser}:${proxyPassword}@${urlObj.host}`,
    );

    this.groq = new Groq({
      apiKey: apiKey,
      httpAgent: this.agent,
    });

    this.logger.log('AppService инициализирован');
  }

  async transcribe(file: Express.Multer.File) {
    this.logger.log(`Начинаем транскрибацию файла: ${file.originalname}, размер: ${file.size} байт`);

    try {
      const response = await this.groq.audio.transcriptions.create({
        model: 'whisper-large-v3-turbo',
        file: await Groq.toFile(file.buffer, file.originalname),
        response_format: 'verbose_json',
      });

      this.logger.log('Транскрибация успешно завершена');

      if (response.text) {
        this.logger.log(`Распознанный текст: ${response.text.substring(0, 100)}...`);
      }

      return response;
    } catch (error) {
      this.logger.error('Ошибка при транскрибации:', error);

      return {
        error: 'Не удалось выполнить транскрибацию',
        message: error.message,
        status: error.status || 500,
      };
    }
  }
}