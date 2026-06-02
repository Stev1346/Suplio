import { requestStatus } from "@/lib/shared/constants/routes";
import { Database } from "@/types/database";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

type RequestCardProps = {
  request: RequestRow;
  rank?: number;
  showVoteButton?: boolean;
  onVote?: (requestId: string) => void;
  voteLoading?: boolean;
  hasVoted?: boolean;
};

export function RequestCard({
  request,
  rank,
  showVoteButton = false,
  onVote,
  voteLoading = false,
  hasVoted = false,
}: RequestCardProps) {
  const isPlayed = request.status === requestStatus.lower.played;

  return (
    <li
      className={`bg-white rounded-lg shadow-md p-4 flex justify-between items-center gap-3 ${
        isPlayed ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0">
        {rank != null && (
          <span className="text-muted-40 text-sm font-medium">{rank}.</span>
        )}{" "}
        <span className="font-medium text-muted-20">{request.song_name}</span>
        {request.artist && (
          <span className="text-muted-40"> - {request.artist}</span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {
          isPlayed && (
            <span className="rounded-full bg-muted-10 px-2 py-0.5 text-xs font-medium ml-auto text-muted-40">
              Played
            </span>
          )
        }
        <span className="text-accent-60 font-semibold">
          {request.votes} vote{request.votes === 1 ? "" : "s"}
        </span>
        {showVoteButton &&
          onVote &&
          (hasVoted ? (
            <button
              type="button"
              onClick={() => onVote(request.id)}
              disabled={voteLoading || isPlayed}
              className="py-1.5 px-3 rounded font-medium bg-red-500 text-white disabled:opacity-50 disabled:hover:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:cursor-pointer"
            >
              <ThumbsDownIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onVote(request.id)}
              disabled={voteLoading || isPlayed}
              className="py-1.5 px-3 rounded font-medium bg-green-500 text-white disabled:opacity-50 disabled:hover:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:cursor-pointer"
            >
              <ThumbsUpIcon />
            </button>
          ))}
      </div>
    </li>
  );
}
