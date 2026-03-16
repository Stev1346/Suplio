const VOTED_STORAGE_KEY = "gotatune_voted";

export type VoteMap = Record<string, string>;

export function getVoteMap(eventCode: string): VoteMap {
  if (typeof window === "undefined") return {};

  try {
    const key = `${VOTED_STORAGE_KEY}_${eventCode}`;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as VoteMap) : {};
  } catch {
    return {};
  }
}

export function getVotedRequestIds(eventCode: string): Set<string> {
  return new Set(Object.keys(getVoteMap(eventCode)));
}

export function setVote(eventCode: string, requestId: string, voteId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${VOTED_STORAGE_KEY}_${eventCode}`;
    const map = getVoteMap(eventCode);
    map[requestId] = voteId;
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    //ignore
  }
}

export function removeVote(eventCode: string, requestId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${VOTED_STORAGE_KEY}_${eventCode}`;
    const map = getVoteMap(eventCode);
    delete map[requestId];
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    //ignore
  }
}