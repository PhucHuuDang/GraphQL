import { Controller, Get, Req, Res } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from 'src/lib/auth';

@Controller('social')
export class SocialController {
  private readonly callbackURL: string = process.env.AUTH_CALLBACK_URL!;
  constructor(private readonly authService: AuthService<typeof auth>) {}

  @Get('github')
  async github(@Req() req: Request, @Res() res: any) {
    console.log('test call in here');
    const data = await this.authService.api.signInSocial({
      body: {
        provider: 'github',
        callbackURL: this.callbackURL,
      },
      headers: fromNodeHeaders(req.headers as any),
    });

    console.log({ data });

    return res.redirect(data.url); // redirect browser tới GitHub
  }
}
