import * as uuid from 'node-uuid';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomController } from './room/RoomController';
import { UserController } from './room/UserController';
import { User } from './room/User';
import youtube, { getYouTubeId } from './youtube/getYouTubeId';
import { Room } from './room/Room';

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
    // console.log(client.handshake.headers.cookie);
  }

  /**
   * 切断時の処理
   * @param client {Socket} 接続者情報
   */
  handleDisconnect(client: Socket) {
    // 全てのルームのデータ
    // console.log(client.adapter.rooms);

    // 退室するユーザの情報を取得
    const user = this.users.getUser(client.id);

    // データ側の退室処理
    const room_list: string[] = this.rooms.leaveAll(client.id);

    // 入室していたルームに退室通知
    for (let room_id of room_list) {
      console.log(`emit: user_left from ${room_id}`);
      this.server.to(room_id).emit('user_left', { user: { id: user?.id, name: user?.name } });
    }

    // ユーザデータ削除
    this.users.remove(client.id);

    console.log(`dissconnect: ${client.id}`);
  }

  /**
   * ルーム作成処理
   * @param client {Socket} 接続者の情報
   * @param user_name {string} ユーザ名
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

      //　ルーム生成
      const room_id: string = uuid.v4();
      this.rooms.createRoom(room_id, client.id);

      // 入室時処理
      this.joinRoom(client, room_id, user);

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
  joinRoomHandler(client: Socket, payload: { room_id?: string; user_name?: string }): boolean {
    // データのチェック 不足している場合return
    console.log('join_room: payload');
    console.log(payload);

    if (!payload) return false;
    if (!payload.room_id || !payload.user_name) {
      console.log('join_failed: データ不足');
      return false;
    }
    // 参加不可の場合return
    if (this.getRoomCount(client) > 1) {
      console.log('join_failed: 既にルームに参加済み');
      false;
    }

    // ルームが存在しない場合return
    const room: Room | undefined = this.rooms.get(payload.room_id);
    if (room === undefined) {
      console.log('join_failed: 不明なルーム');
      return false;
    }

    // ユーザ情報取得 存在しない場合はreturn
    const user: User | undefined = this.users.getUser(client.id);
    if (user === undefined) {
      console.log('join_failed: 不明なユーザ');
      return false;
    }

    // ---- 正常な場合の処理 ---

    // 名前のセット
    user.name = payload.user_name;

    // 入室処理
    this.joinRoom(client, payload.room_id, user);

    return true;
  }

  /**
   * 入室時の処理
   * @param client
   * @param room_id
   * @param user
   */
  joinRoom(client: Socket, room_id: string, user: User) {
    // 入室時の処理
    this.rooms.join(room_id, user);
    client.join(room_id);

    // ルームに通知
    console.log(user);
    const user_data = {
      id: user.id,
      name: user.name
    };
    console.log(user_data);
    console.log(`user_joind: ${user.id} ${user.name}`);
    this.server.to(room_id).emit('user_joined', { user: user_data });
  }

  @SubscribeMessage('check_room')
  checkRoomHandler(client: Socket, room_id: string): boolean {
    if (!room_id) return false;

    return this.rooms.exists(room_id);
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

  /** 再生 */
  @SubscribeMessage('youtube_play')
  youtubePlayHandler(client: Socket, time: number) {
    if (!time) return;

    const room_id: string | null = this.getRoomId(client);
    if (!room_id) return;

    console.log('youtube_play', time);
    client.to(room_id).broadcast.emit('youtube_play', time);
  }

  /** ポーズ */
  @SubscribeMessage('youtube_pause')
  youtubeStopHandler(client: Socket, time: number) {
    if (!time) return;

    const room_id: string | null = this.getRoomId(client);
    if (!room_id) return;

    console.log('youtube_pause', time);

    client.to(room_id).broadcast.emit('youtube_pause', time);
  }

  @SubscribeMessage('youtube_add_movie')
  youtubeAddMovieHandler(client: Socket, url: string) {
    // URLのバリデーション
    const movie_id: string | null = youtube.getYouTubeId(url);

    const room_id: string | null = this.getRoomId(client);
    if (!room_id) return;

    console.log(movie_id);
    if (movie_id) this.server.to(room_id).emit('youtube_add_movie', movie_id);
  }

  /**
   * シーク時処理
   * @param client {Socket} 接続者情報
   * @param time {number} シークした場所
   */
  @SubscribeMessage('youtube_seek')
  youtubeSeekHandler(client: Socket, time: number) {
    if (time) client.broadcast.emit('youtube_seek', time);
  }

  /** 入室時の再生データ同期 */
  @SubscribeMessage('send_playing_data')
  sendPlayingDataHandler(client: Socket, payload?: { socket_id: string; playingData: PlayingData }) {
    if (!payload) {
      console.log('send_playing_data: データが不足しています。');
      return;
    }

    console.log('send_palying_data:');
    console.log(payload);
    this.server.to(payload.socket_id).emit('new_playing_data', payload.playingData);
  }

  /**
   * 再生情報を同期する処理
   * @param client Socket接続者情報
   * @returns void
   */
  @SubscribeMessage('youtube_sync')
  youtubeSyncHandler(client: Socket) {
    const room_id = this.getRoomId(client);

    if (room_id === null) {
      console.log('youtube_sync: ルームに未入室');
      return;
    }

    const room = this.rooms.get(room_id);

    if (room === undefined) {
      console.log('youtube_sync: ルームが存在しない');
      return;
    }

    if (room.roomMaster === client.id) {
      // ルームマスターの場合
    } else {
      // それ以外の場合
      this.requestPlayingData(room.roomMaster, client.id);
    }
  }

  @SubscribeMessage('add_queue')
  addQueueHandler(client: Socket, payload?: { movie_id: string; index?: number }) {
    // データチェック
    if (payload === undefined) {
      console.log('add_queue: データ不足');
      return;
    }

    // ルームの取得
    const room_id = this.getRoomId(client) || '';
    const room = this.rooms.get(room_id);

    if (room === undefined) {
      console.log('add_queue: 部屋が存在しない');
      return;
    }

    const id = getYouTubeId(payload.movie_id);
    this.server.to(room.id).emit('new_movie', { movie_id: id });

    // 新機能予定
    // room.playlist.add(payload.movie_id, payload.index)
  }

  /**
   * ルームマスターにplayingDataをリクエスト
   * @param room_master_id
   * @param participant_id
   */
  requestPlayingData(room_master_id: string, participant_id: string) {
    console.log('request_playing_data: to', room_master_id);
    this.server.to(room_master_id).emit('request_playing_data', participant_id);
  }

  /**
   * queueの情報をルーム全体に送信
   * @param room_id {string} ルームID
   * @param queue {string[]} queueの情報
   */
  sendNewQueue(room_id: string, queue: string[]) {
    this.server.to(room_id).emit('new_queue', { queue });
  }

  /**
   * 参加ルーム数の取得
   * @param client {Socket} websocket接続データ
   * @returns {number} 参加ルーム数
   */
  getRoomCount(client: Socket): number {
    return Object.keys(client.rooms).length;
  }

  /**
   * clientが入室しているルームのIDを取得
   * @param client
   * @returns {string} ルームID
   */
  getRoomId(client: Socket): string | null {
    if (this.getRoomCount(client) <= 1) return null;

    let id: string | null = null;
    Object.keys(client.rooms).forEach((room_id) => {
      if (room_id !== client.id) {
        id = room_id;
      }
    });

    return id;
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

export type PlayingData = {
  /** 動画ID */
  movie_id?: string;
  /** 再生時間 */
  time: number;
  /** 再生中かどうか */
  isPlaying: boolean;
};
