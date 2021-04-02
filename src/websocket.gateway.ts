import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import uuid from 'node-uuid';
import { RoomController } from './room/RoomController';
import { timeStamp } from 'node:console';
import { truncate } from 'node:fs';

@WebSocketGateway()
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  rooms: RoomController;

  constructor() {
    this.rooms = new RoomController();
  }

  /**
   * 接続時の処理
   * @param client {Socket} 接続者情報
   */
  handleConnection(client: Socket) {
    console.log(`connect: ${client.id}`);
    // 恐らくcookie取り出せる。パースされてない。
    // client.handshake.headers.cookie;
  }

  /**
   * 切断時の処理
   * @param client {Socket} 接続者情報
   */
  handleDisconnect(client: Socket) {
    // データ側の退室処理
    Object.keys(client.rooms).forEach((key) => {
      const room_id = client.rooms[key];
      if (key !== room_id) {
        this.rooms.leave(room_id, client.id);
      }
    });

    // websocket側の退室処理
    client.leaveAll();

    console.log(`dissconnect: ${client.id}`);
  }

  /**
   * ルーム作成処理
   * @param client {Socket} 接続者の情報
   * @returns {Object}
   * @returns {boolean} result 作成の成否
   * @returns {string} room_id ルームID
   */
  @SubscribeMessage('create_room')
  handleCreateRoom(client: Socket): createRoomRes {
    /** ユーザが入室しているルーム数 */
    const room_count: number = Object.keys(client.rooms).length;

    // デフォルトで自分のwebsocketのidと同名の部屋に入っているため、
    // room_countが1以下ならば他の部屋に入っていないことになります。
    if (room_count <= 1) {
      // 未入室

      /** ルームID */
      const room_id: string = uuid.v4();

      // ルーム生成
      this.rooms.createRoom(room_id);

      // データ側の入室処理
      this.rooms.join(room_id, client.id);

      // websocket側の入室処理
      client.join(room_id);

      return { result: true, room_id };
    } else {
      // 入室済
      return { result: false };
    }
  }

  /**
   * 入室処理
   * @param client websocket接続情報
   * @param room_id ルームID
   * @returns {boolean} 入室の成否
   */
  @SubscribeMessage('join_room')
  joinRoomHandler(client: Socket, room_id: string): boolean {
    // 参加不可の場合return
    if (this.getRoomCount(client) > 1) return false;

    // ルームが存在しない場合return
    if (this.rooms.exists(room_id) === false) return false;

    // データ側の入室処理
    this.rooms.join(room_id, client.id);

    // websocket側の入室処理
    client.join(room_id);

    return true;
  }

  /**
   * 参加ルーム数の取得
   * @param client {Socket} websocket接続データ
   * @returns {number} 参加ルーム数
   */
  getRoomCount(client: Socket): number {
    return Object.keys(client.rooms).length;
  }
}

export type createRoomRes = {
  result: boolean;
  room_id?: string;
};
