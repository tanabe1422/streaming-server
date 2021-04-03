import * as uuid from 'node-uuid';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomController } from './room/RoomController';
import { UserController } from './room/UserController';
import { User } from './room/User';

@WebSocketGateway()
export class WebsocketGateway {
  @WebSocketServer()
  server!: Server;
  /** ルーム情報を扱う */
  rooms: RoomController;
  /** ユーザ情報を扱う */
  users: UserController;

  constructor() {
    this.rooms = new RoomController();
    this.users = new UserController();
  }

  /**
   * 接続時の処理
   * @param client {Socket} 接続者情報
   */
  handleConnection(client: Socket) {
    console.log(`connect: ${client.id}`);
    // ユーザ情報を追加
    this.users.add(client.id);
    // 恐らくcookie取り出せる。パースされてない。
    // client.handshake.headers.cookie;
  }

  /**
   * 切断時の処理
   * @param client {Socket} 接続者情報
   */
  handleDisconnect(client: Socket) {
    // 全てのルームのデータ
    // console.log(client.adapter.rooms);

    // データ側の退室処理
    this.rooms.leaveAll(client.id);

    // ユーザデータ削除
    this.users.remove(client.id);

    // websocket側の退室処理は自動で行われるため、必要なし
    // client.leaveAll();

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
  createRoomHandler(client: Socket, user_name: string): CreateRoomRes {
    // ユーザ名のチェック
    if (!user_name) {
      return { result: false };
    }

    // ユーザ情報取得 存在しない場合はreturn
    const user: User | undefined = this.users.getUser(client.id);
    if (user === undefined) return { result: false };

    // 名前をセット
    user.name = user_name;

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

      // 入室処理
      this.rooms.join(room_id, client.id); // データ側
      client.join(room_id); // websocket側

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
   * ユーザ名設定処理
   * @param client websocket接続情報
   * @param user_name {string} ユーザ名
   */
  @SubscribeMessage('set_name')
  setNameHandler(client: Socket, user_name: string): boolean {
    // TODO: user_nameのバリデーション

    // ユーザ情報取得
    const user: User | undefined = this.users.getUser(client.id);

    if (user) {
      // 名前をセット
      user.name = user_name;
      return true;
    } else {
      return false;
    }
  }

  @SubscribeMessage('send_message')
  sendMessageHandler(client: Socket, msg: string) {
    // TODO: msgのバリデーション

    // ユーザ名取得
    const user_name = this.users.getUser(client.id)?.name || `Unknown User(${client.id}`;

    /** レスポンスデータ */
    const newMsgRes: NewMsgRes = {
      user_id: client.id,
      user_name,
      msg
    };

    Object.keys(client.rooms).forEach((room_id) => {
      if (room_id !== client.id) {
        // 自分以外に送信
        client.broadcast.to(room_id).emit('new_message', newMsgRes);
      }
    });
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

/** create_roomのResponse */
export type CreateRoomRes = {
  result: boolean;
  room_id?: string;
};

export type NewMsgRes = {
  /** ユーザID */
  user_id: string;
  /** ユーザ名 */
  user_name?: string;
  /** メッセージ */
  msg: string;
};
