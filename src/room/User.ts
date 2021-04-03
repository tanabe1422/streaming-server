/**
 * ユーザ
 * @param id {string} ユーザID
 */
export class User {
  readonly id: string;
  private _name: string;

  /**
   * コンストラクタ
   * @param user_id {string} ユーザID
   */
  constructor(user_id: string) {
    this.id = user_id;
    this._name = `Guest`;
  }

  /** ユーザ名 */
  set name(name: string) {
    this._name = name;
  }

  /** ユーザ名 */
  get name(): string {
    return this._name;
  }
}
