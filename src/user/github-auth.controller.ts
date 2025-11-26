import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';

@Controller('api/auth/callback')
export class GithubAuthController {
  constructor(private readonly userService: UserService) {}

  @Get('github')
  async githubCallback(@Req() req: any) {
    return this.userService.githubCallback(req);
  }
}
