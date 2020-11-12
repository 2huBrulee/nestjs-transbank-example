import { Body, Controller, Get, Post, Render, Req } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransbankService } from './transbank.service';

@Controller('transbank')
export class TransbankController {
  constructor(private transbankService: TransbankService) {}

  @Get('init')
  @Render('redirect-transbank')
  init(@Req() req: any): Observable<unknown> {
    console.log(req.get('host'));
    return this.transbankService.init(req.get('host') || '').pipe(
      map((data: any) => ({
        url: data.url,
        token: data.token,
        inputName: 'TBK_TOKEN',
      })),
    );
  }

  @Post('response')
  @Render('redirect-transbank')
  response(@Body('token_ws') token: string): Observable<unknown> {
    return this.transbankService.response(token).pipe(
      map((data: any) => ({
        url: data.urlRedirection,
        token,
        inputName: 'token_ws',
      })),
    );
  }

  @Post('finish')
  @Render('finish')
  finish(
    @Body() body: { TBK_TOKEN?: string; token_ws?: string },
  ): Observable<unknown> {
    return this.transbankService.finish(body.TBK_TOKEN, body.token_ws);
  }
}
