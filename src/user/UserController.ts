import { User } from './User';

/** ユーザ情報を管理するクラス */
export class UserController {
  private users: { [key: string]: User };

  constructor() {
    this.users = {};
  }

  /**
   * ユーザデータを追加
   * @param user_id {string} ユーザID
   */
  add(user_id: string) {
    this.users[user_id] = new User(user_id);
  }

  /**
   * ユーザデータを削除
   * @param user_id {string} ユーザID
   */
  remove(user_id: string) {
    delete this.users[user_id];
  }

  getUser(user_id: string): User | undefined {
    return this.users[user_id];
  }
}
