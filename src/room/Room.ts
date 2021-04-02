export class Room {
  private _id: string;
  users: { [key: string]: User };

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
}

/**
 * 参加しているユーザ
 * @param id {string} ユーザID
 */
export class User {
  private _id: string;
  private _name: string;

  constructor(id: string) {
    this._id = id;
  }

  /** ユーザ名 */
  set name(name: string) {
    this._name = name;
  }

  /** ユーザ名 */
  get name(): string {
    return this._name;
  }

  /** ユーザID */
  get id(): string {
    return this._id;
  }
}
