import { Logger } from '@nestjs/common';
import { Room } from './Room';
import { User } from '../user/User';

/** ルーム情報を管理するクラス */
export class RoomController {
  private rooms: { [key: string]: Room };

  constructor() {
    this.rooms = {};
  }

  /** ルーム作成 */
  createRoom(room_id: string, user_id: string) {
    const room: Room = new Room(room_id, user_id);
    this.rooms[room_id] = room;
    Logger.log(room_id, 'create_room');
  }

  /** ルーム削除 */
  deleteRoom(room_id: string): boolean {
    if (this.rooms[room_id]) {
      delete this.rooms[room_id];
      Logger.log(room_id, 'delete_room');
    }

    return true;
  }

  /**
   * 参加処理
   * @param room_id {string} ルームID
   * @param user_id {string} ユーザID
   */
  join(room_id: string, user: User) {
    this.rooms[room_id].addUser(user);
    Logger.log(`user: ${user.id} room: ${room_id}`, 'Join');
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
    Logger.log(`user: ${user_id} room: ${room_id}`, 'Leave');

    // 空のルームを削除
    if (room.userCount === 0) {
      this.deleteRoom(room_id);
    } else {
      console.log(`changed roomMaster from ${user_id} to ${room.roomMaster}`);
    }
  }

  /** 全てのルームからユーザを退室 */
  leaveAll(user_id: string): string[] {
    let rooms: string[] = [];
    Object.keys(this.rooms).forEach((room_id) => {
      if (this.rooms[room_id].userExists(user_id)) {
        this.leave(room_id, user_id);
        rooms.push(room_id);
      }
    });
    return rooms;
  }

  /**
   * ルームが存在するか
   * @param room_id
   * @returns {boolean}
   */
  exists(room_id: string): boolean {
    return !!this.rooms[room_id];
  }

  get(room_id: string): Room | undefined {
    return this.rooms[room_id];
  }
}
