import { Client, Socket } from 'socket.io';

// export class PlayList implements IterableIterator<string> {
export interface QueueItem {
  videoId: string;
  thumbnail: string;
  title: string;
  requester: string;
}

export class Queue {
  constructor(private _data: QueueItem[]) {}

  private insert(index: number, queueItem: QueueItem) {
    this._data.splice(index, 0, queueItem);
  }

  /**
   * プレイリストに動画を追加
   * @param movie_id youtubeの動画ID
   * @param index 挿入箇所を指定可能
   */
  add(queueItem: QueueItem, index?: number) {
    if (index) {
      this.insert(index, queueItem);
    } else {
      this._data.push(queueItem);
    }
  }

  /**
   * 先頭の動画IDを抜き出す
   * @returns {string|undefined} 先頭の動画ID
   */
  pop(): QueueItem | undefined {
    return this._data.pop();
  }

  /**
   * n番目のデータを削除
   * @param index
   */
  remove(index: number): void {
    this._data.splice(index);
  }

  /**
   * プレイリストを配列で取得
   * @return {string[]} プレイリスト
   */
  get data(): QueueItem[] {
    return this._data;
  }

  static generateQueueItem(client: Socket, video_id: string, video_title: string): QueueItem {
    const thumbnail = `http://img.youtube.com/vi/${video_id}/mqdefault.jpg`;

    return {
      requester: client.id,
      title: video_title,
      thumbnail,
      videoId: video_id
    };
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
