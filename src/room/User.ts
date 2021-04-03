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
