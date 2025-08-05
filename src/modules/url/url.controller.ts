import { Controller, Get, Post, Body, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';

@ApiTags('URLs')
@Controller('api/urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'URL shortened successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Custom code already exists' })
  async createUrl(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.createUrl(createUrlDto);
  }

  @Get('list')
  @ApiOperation({ summary: 'List all URLs' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of URLs' })
  async getUrls(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.urlService.getUrls(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'URL Statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics' })
  async getStats() {
    return this.urlService.getStats();
  }
}