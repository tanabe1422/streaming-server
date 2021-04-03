import { Room } from './Room';

/** ルーム情報を管理するクラス */
export class RoomController {
  rooms: { [key: string]: Room };

  constructor() {
    this.rooms = {};
  }

  /** ルーム作成 */
  createRoom(room_id: string) {
    const room: Room = new Room(room_id);
    this.rooms[room_id] = room;
    console.log('create_room:', room_id);
  }

  /** ルーム削除 */
  deleteRoom(room_id: string): boolean {
    if (this.rooms[room_id]) {
      delete this.rooms[room_id];
      console.log('delete_room:', room_id);
    }

    return true;
  }

  /**
   * 参加処理
   * @param room_id {string} ルームID
   * @param user_id {string} ユーザID
   */
  join(room_id: string, user_id: string) {
    this.rooms[room_id].addUser(user_id);
    console.log('join:', user_id, 'enters', room_id);
  }

  /**
   * 退室処理
   * @param room_id {string} ルームID
   * @param user_id {string} ユーザID
   */
  leave(room_id: string, user_id: string) {
    const room = this.rooms[room_id];

    // ルームからユーザを削除
    room.removeUser(user_id);
    console.log('leave:', user_id, 'leaves', room_id);

    // 空のルームを削除
    if (room.userCount === 0) {
      this.deleteRoom(room_id);
    }
  }

  /** 全てのルームからユーザを退室 */
  leaveAll(user_id: string) {
    Object.keys(this.rooms).forEach((room_id) => {
      if (this.rooms[room_id].userExists(user_id)) {
        this.leave(room_id, user_id);
      }
    });
  }

  /**
   * ルームが存在するか
   * @param room_id
   * @returns {boolean}
   */
  exists(room_id: string): boolean {
    return !!this.rooms[room_id];
  }
}
