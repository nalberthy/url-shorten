import {
  IsString,
  IsUrl,
  IsOptional,
  Length,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'Original URL to shorten',
    example:
      'https://teddy360.com.br/material/marco-legal-das-garantias-sancionado-entenda-o-que-muda',
  })
  @IsUrl({}, { message: 'URL must be valid' })
  originalUrl: string;

  @ApiProperty({
    description: 'Custom code (optional)',
    example: 'mycustomcode',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 20, { message: 'Code must be between 3 and 20 characters long' })
  customCode?: string;

  @ApiProperty({
    description: 'URL is public',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;
}
