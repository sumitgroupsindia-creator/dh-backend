import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHome() {
    return {
      name: 'DH Financial Services API',
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
