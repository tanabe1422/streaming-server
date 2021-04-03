/**
 * 動画ID取得
 * @param url {string} 動画URL
 * @returns {string|null} 動画IDまたはnull
 */
export function getYouTubeId(url: string): string | null {
  /* eslint-disable no-useless-escape */
  const ptn1 = "^https:\/\/(youtu\.be|www\.youtube\.com\/v)/";
  const ptn2 = "^https:\/\/www\.youtube\.com\/watch"
  const ptn3 = '^(\/v\/|\/)'
  /* eslint-enable */

  /** URL判定1 */
  const reg1 = new RegExp(ptn1)
  /** URL判定2 */
  const reg2 = new RegExp(ptn2)
  /** 置換用 */
  const reg3 = new RegExp(ptn3)

  if(reg1.test(url)) {
    return new URL(url).pathname.replace(reg3, '')
  }

  if(reg2.test(url)) {
    return new URL(url).searchParams.get('v')
  }

  return null
}

export default {
  getYouTubeId
}