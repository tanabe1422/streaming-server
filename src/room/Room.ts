import { Queue } from '../queue/Queue';
import { User } from './User';

/** ルーム */
export class Room {
  private _id: string;
  private users: { [key: string]: User };
  playlist: Queue = new Queue([]);
  roomMaster: string;

  constructor(room_id: string, user_id: string) {
    this._id = room_id;
    this.users = {};
    this.roomMaster = user_id;
  }

  get id(): string {
    return this._id;
  }

  /**
   * ルームにユーザを追加する
   * @param user_id {string} ユーザID
   */
  addUser(user: User) {
    this.users[user.id] = user;
  }

  /**
   * ルームからユーザを取り除く
   * @param user_id {string} ユーザID
   */
  removeUser(user_id: string) {
    delete this.users[user_id];

    // 退出したユーザがルームマスターだった場合
    if (user_id === this.roomMaster) {
      if (Object.keys(this.users).length > 0) {
        // 適当にルームマスター選出
        this.roomMaster = Object.keys(this.users)[0];
      }
    }
  }

  /** ルーム人数 */
  get userCount(): number {
    return Object.keys(this.users).length;
  }

  /**
   * ルームにユーザが存在するか
   * @param user_id {string} ユーザID
   * @returns {boolean}
   */
  userExists(user_id: string): boolean {
    return !!this.users[user_id];
  }
}
