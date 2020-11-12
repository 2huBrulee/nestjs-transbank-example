import { Injectable, NotFoundException } from '@nestjs/common';
import { from, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Transbank from 'transbank-sdk';
import * as hbs from 'hbs';

@Injectable()
export class TransbankService {
  Webpay: any;
  transactions = {};

  constructor() {
    const configuration = Transbank.Configuration.forTestingWebpayPlusNormal();
    this.Webpay = new Transbank.Webpay(configuration).getNormalTransaction();

    hbs.registerHelper('isAuthorized', (status) => status === 'AUTHORIZED');
    hbs.registerHelper('isRejected', (status) => status === 'REJECTED');
    hbs.registerHelper('jsonStringify', (json) =>
      JSON.stringify(json, null, 2),
    );
  }

  init(host: string): Observable<unknown> {
    const url = 'http://' + host;
    const amount = 1500;
    return from(
      this.Webpay.initTransaction(
        amount,
        'Orden ' + 12345,
        null,
        url + '/transbank/response',
        url + '/transbank/finish',
      ),
    ).pipe(
      tap((data: any) => (this.transactions[data.token] = { amount: amount })),
      tap((data: any) => console.log(data)),
    );
  }

  response(token: string): Observable<unknown> {
    return from(this.Webpay.getTransactionResult(token)).pipe(
      tap((data) => (this.transactions[token] = data)),
      tap((data: any) => console.log(data)),
    );
  }

  finish(tbkToken: string, wsToken: string): Observable<unknown> {
    let status = null;
    let transaction: any;
    if (tbkToken) status = 'ABORTED';
    if (wsToken) {
      transaction = this.transactions[wsToken];
      if (transaction.detailOutput[0].responseCode === 0) {
        status = 'AUTHORIZED';
      } else {
        status = 'REJECTED';
      }
    }
    if (!status) throw new NotFoundException();
    return of({ transaction, status });
  }
}
