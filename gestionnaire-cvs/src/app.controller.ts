import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('seed')
  async seed() {
    return await this.appService.seedDatabase();
  }
}
