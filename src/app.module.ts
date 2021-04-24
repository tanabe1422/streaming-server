import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { WebsocketService } from './websocket/websocket.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway, WebsocketService]
})
export class AppModule {}
