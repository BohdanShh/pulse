/** Host of the URL, or the URL itself if it cannot be parsed (validation rejects it later). */
export function defaultMonitorName(url: string): string {
  return URL.parse(url)?.hostname || url;
}
