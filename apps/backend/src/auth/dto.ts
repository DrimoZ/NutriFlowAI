import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() @MaxLength(120) email!: string;
  @IsString() @MinLength(10) @MaxLength(72) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'password must contain letters and numbers' }) password!: string;
  @IsString() @MinLength(2) @MaxLength(80) name!: string;
}

export class LoginDto {
  @IsEmail() @MaxLength(120) email!: string;
  @IsString() @MinLength(10) @MaxLength(72) password!: string;
}
