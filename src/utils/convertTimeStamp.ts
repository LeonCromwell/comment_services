function convertTimeStamp(timestamp: NativeDate): number {
  return Math.floor(timestamp.getTime() / 1000);
}
export default convertTimeStamp;
