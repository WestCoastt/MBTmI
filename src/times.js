export default function times(timeStamp) {
  const min = 60;
  const hour = 60 * 60;
  const day = 60 * 60 * 24;
  const month = 60 * 60 * 24 * 30;
  const year = 60 * 60 * 24 * 365;

  const currentTime = new Date() / 1000;

  const timeGap = currentTime - timeStamp;

  if (timeGap > year) {
    return Math.floor(timeGap / year) + "년 전";
  } else if (timeGap > month) {
    return Math.floor(timeGap / month) + "개월 전";
  } else if (timeGap > day) {
    return Math.floor(timeGap / day) + "일 전";
  } else if (timeGap > hour) {
    return Math.floor(timeGap / hour) + "시간 전";
  } else if (timeGap > min) {
    return Math.floor(timeGap / min) + "분 전";
  } else {
    return "방금 전";
  }
}
