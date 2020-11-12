import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransbankModule } from './transbank/transbank.module';

@Module({
  imports: [TransbankModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
