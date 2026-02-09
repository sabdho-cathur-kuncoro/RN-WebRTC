export function extractFirstAndEndingNumber(text: string): string {
  const first = text.charAt(0);

  // match all digits at the end of the string
  const match = text.match(/\d+$/);
  const endingNumber = match ? match[0] : "";

  return first + endingNumber;
}

export function shortestAngleDiff(from: number, to: number) {
  let diff = to - from;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

export function moveCurrentUserFirst(
  list: any[],
  currentDeviceId: string
): any[] {
  const mine = list.filter((i) => i.device_id === currentDeviceId);
  const others = list.filter((i) => i.device_id !== currentDeviceId);

  return [...mine, ...others];
}

export const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

export function formatUnit(code: string): string {
  return code.replace(/^UNIT/, "U");
}
