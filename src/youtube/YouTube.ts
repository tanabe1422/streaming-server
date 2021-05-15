import axios, { AxiosResponse } from 'axios';
require('dotenv').config();

export class YouTube {
  /** 動画IDから動画のタイトルを取得 */
  async getVideoTitle(video_id: string): Promise<string> {
    if (!process.env.YOUTUBE_KEY) return 'apiキーが無効';

    const response: AxiosResponse<any> | undefined = await axios
      .get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          key: process.env.YOUTUBE_KEY,
          part: 'snippet',
          id: video_id,
          maxResults: 1
        }
      })
      .catch((e) => {
        console.log('error');
        console.log(e);
        return undefined;
      });

    if (!response) return 'タイトル取得失敗';

    return response.data.items[0].snippet.title;
  }

  /**
   * 動画ID取得
   * @param url {string} 動画URL
   * @returns {string|null} 動画IDまたはnull
   */
  static getYouTubeId(url: string): string | null {
    /* eslint-disable no-useless-escape */
    const ptn0 = '^[A-z0-9-_]{11}$';
    const ptn1 = '^https://(youtu.be|www.youtube.com/v)/';
    const ptn2 = '^https://www.youtube.com/watch';
    const ptn3 = '^(/v/|/)';
    /* eslint-enable */

    const reg0 = new RegExp(ptn0);
    /** URL判定1 */
    const reg1 = new RegExp(ptn1);
    /** URL判定2 */
    const reg2 = new RegExp(ptn2);
    /** 置換用 */
    const reg3 = new RegExp(ptn3);

    if (reg0.test(url)) {
      return url;
    }

    if (reg1.test(url)) {
      return new URL(url).pathname.replace(reg3, '');
    }

    if (reg2.test(url)) {
      return new URL(url).searchParams.get('v');
    }

    return null;
  }
}
