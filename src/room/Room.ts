import { User } from './User';

/** ルーム */
export class Room {
  private _id: string;
  private users: { [key: string]: User };
  playlist: string[] = [];
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

    console.log('a');

    // 退出したユーザがルームマスターだった場合
    if (user_id === this.roomMaster) {
      console.log('i');
      if (Object.keys(this.users).length > 0) {
        // 適当にルームマスター選出
        console.log('u');
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
