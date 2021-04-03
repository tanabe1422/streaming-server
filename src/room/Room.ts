import { User } from './User';

/** ルーム */
export class Room {
  private _id: string;
  private users: { [key: string]: User };

  constructor(room_id: string) {
    this._id = room_id;
    this.users = {};
  }

  get id(): string {
    return this._id;
  }

  /**
   * ルームにユーザを追加する
   * @param user_id {string} ユーザID
   */
  addUser(user_id: string) {
    const user: User = new User(user_id);
    this.users[user_id] = user;
  }

  /**
   * ルームからユーザを取り除く
   * @param user_id {string} ユーザID
   */
  removeUser(user_id: string) {
    delete this.users[user_id];
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
