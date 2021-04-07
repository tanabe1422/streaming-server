// export class PlayList implements IterableIterator<string> {
  export class Queue {
 
  constructor(private _data: string[]){
    
  }

  private insert(index: number, movie_id: string | string[]) {
    this._data.splice(index, 0, ...movie_id)
    
  }

  /**
   * プレイリストに動画を追加
   * @param movie_id youtubeの動画ID
   * @param index 挿入箇所を指定可能
   */
  add(movie_id: string | string[], index?: number) {
    if(index) {
      this.insert(index, movie_id)
    } else{
      this._data.push(...movie_id)
    }
  }

  /**
   * 先頭の動画IDを抜き出す
   * @returns {string|undefined} 先頭の動画ID
   */
  pop():string | undefined {
    return this._data.pop()
  }

  /**
   * n番目のデータを削除
   * @param index 
   */
  remove(index: number): void {
    this._data.splice(index)
  }

  /**
   * プレイリストを配列で取得
   * @return {string[]} プレイリスト
   */
  get data(): string[]{
    return this._data
  }

  // public next(): IteratorResult<string> {
  //   if (this.pointer < this.movie_ids.length) {
  //     return {
  //       done: false,
  //       value: this.movie_ids[this.pointer++]
  //     }
  //   } else {
  //     return {
  //       done: true,
  //       value: null
  //     }
  //   }
  // }

  // [Symbol.iterator](): IterableIterator<string> {
  //   return this;
  // }
  
}