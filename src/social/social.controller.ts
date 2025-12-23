import { Controller, Get, Req, Res } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';
import { BetterAuthService } from '../auth/better-auth.service';

@Controller('social')
export class SocialController {
  constructor(private readonly authService: BetterAuthService) {}

  @Get('github')
  async github(@Req() req: Request, @Res() res: any) {
    const data = await this.authService.api.signInSocial({
      body: {
        provider: 'github',
        callbackURL: 'http://localhost:3000/blogs',
      },
      headers: fromNodeHeaders(req.headers as any),
    });

    console.log({ data });

    // console.log('headers: ', fromNodeHeaders(req.headers as any));

    return res.redirect(data.url);
  }
}
