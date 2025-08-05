import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { RedirectController } from './redirect.controller';

@Module({
  controllers: [UrlController, RedirectController],
  providers: [UrlService],
})
export class UrlModule {}