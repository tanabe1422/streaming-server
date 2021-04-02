import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  // @SubscribeMessage('message')
  // handleMessage(client: Socket, payload: any): string {
  //   return 'Hello world!';
  // }

  // 接続時の処理
  handleConnection(client: Socket) {
    console.log(`connect: ${client.id}`);
    // 恐らくcookie取り出せる。パースされてない。
    // client.handshake.headers.cookie;
  }

  // 切断時の処理
  handleDisconnect(client: Socket) {
    console.log(`dissconnect: ${client.id}`);
  }
}
