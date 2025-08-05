import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  UseGuards,
  Request,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('URLs')
@Controller('api/urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'URL shortened successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Custom code already exists',
  })
  async createUrl(@Body() createUrlDto: CreateUrlDto, @Request() req) {
    return this.urlService.createUrl(createUrlDto, req.user?.id);
  }

  @Get('list')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all URLs' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of URLs' })
  async getUrls(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?,
  ) {
    return this.urlService.getUrls(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      req.user?.id,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my URLs' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of my URLs' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Login required',
  })
  async getMyUrls(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?,
  ) {
    return this.urlService.getMyUrls(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('stats')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'URL Statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics' })
  async getStats(@Request() req) {
    return this.urlService.getStats(req.user?.id);
  }

  @Delete(':code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a URL' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'URL deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Login required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You do not own the URL',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'URL not found' })
  async deleteUrl(@Param('code') code: string, @Request() req) {
    return this.urlService.deleteUrl(code, req.user.id);
  }
}
