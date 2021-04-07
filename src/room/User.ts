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
  constructor(user_id: string, user_name?: string) {
    this.id = user_id;
    this._name = `Guest`;
    if(user_name) this._name = user_name
  }

  /** ユーザ名 */
  set name(name: string) {
    this._name = User.replaceUserName(name);
  }

  /** ユーザ名 */
  get name(): string {
    return this._name;
    
  }

  /**
   * ユーザ名を浄化します
   * @param user_name 浄化前のuser_name
   * @returns {string} 浄化されたuser_name
   */
  static replaceUserName(user_name: string) :string{
    //TODO: 浄化処理
    return user_name
  }
}
