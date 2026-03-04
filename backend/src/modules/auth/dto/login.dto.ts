import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@gamecenter.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'GameCenter2026!' })
  @IsString()
  @MinLength(6)
  password: string;
}
