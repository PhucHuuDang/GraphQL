import { Controller, Get, Req, Res } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from 'src/lib/auth';

@Controller('social')
export class SocialController {
  constructor(private readonly authService: AuthService<typeof auth>) {}

  @Get('github')
  async github(@Req() req: Request, @Res() res: any) {
    const data = await auth.api.signInSocial({
      body: {
        provider: 'github',
        callbackURL: 'http://localhost:3001/api/auth/callback/github',
      },
      // headers: fromNodeHeaders(req.headers as any),
    });

    console.log({ data });

    return res.redirect(data.url); // redirect browser tới GitHub
    // redirect browser tới GitHub
    // return data; // redirect browser tới GitHub
  }
}
