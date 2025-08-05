import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { UrlService } from './url.service';

@ApiTags('Redirection')
@Controller()
export class RedirectController {
  constructor(private readonly urlService: UrlService) {}

  @Get(':code')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({ status: HttpStatus.MOVED_PERMANENTLY, description: 'Successful redirection' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Code not found' })
  async redirect(@Param('code') code: string, @Res() res: Response) {
    try {
      const url = await this.urlService.findByCode(code);
      return res.redirect(HttpStatus.MOVED_PERMANENTLY, url.originalUrl);
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'URL not found',
        code,
      });
    }
  }
}