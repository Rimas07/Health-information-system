import { Body, Controller, Post, Req,Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginCredentialsDto } from './dto/credentials.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { access } from 'fs';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return JWT token'
  })
  @ApiBody({ type: LoginCredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2Y4ZGE4YjQ1MjM0NTY3ODkwYWJjZGUiLCJ0ZW5hbnRJZCI6ImFiYzEyM2RlZjQ1NiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMzU5NjAwfQ.example_signature'
        },
        tenantId: {
          type: 'string',
          example: 'abc123def456'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials'
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data'
  })
  async login(@Body() credentials: LoginCredentialsDto, @Res() res: any) {
    const result = await this.authService.login(credentials)

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      accessToken: result.accessToken,
      tenantId: result.tenantId
    })
  }

  @Post('refresh')
  async refresh(@Req() req: any, @Res() res: any) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({message:'Refresh token missing'})
    }
    const result = await this.authService.refreshToken(refreshToken);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ accessToken: result.accessToken });

  }
}
