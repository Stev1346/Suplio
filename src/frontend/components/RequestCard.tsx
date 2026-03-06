import { Database } from "@/types/database";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

type RequestCardProps = {
    request: RequestRow;
    rank?: number;
    showVoteButton?: boolean;
    onVote?:  (requestId: string) => void;
    voteLoading?: boolean;
};

export function RequestCard({
    request,
    rank,
    showVoteButton = false,
    onVote,
    voteLoading = false
}: RequestCardProps){
    return (
        <li className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center gap-3">
            <div className="min-w-0">
                {rank != null && (
                    <span className="text-muted-500 text-sm font-medium">{rank}.</span>
                )}{" "}
                <span className="font-medium text-primary-900">{request.song_name}</span>
                {request.artist && (
                    <span className="text-muted-500"> - {request.artist}</span>
                )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <span className="text-tertiary-500 font-semibold">{request.votes} votes</span>
                {showVoteButton && onVote && (
                    <button type="button" onClick={() => onVote(request.id)}
                    disabled={voteLoading}
                    className="py-1.5 px-3 rounded font-medium bg-tertiary-500 text-white disabled:opacity-50 hover:opacity-90"
                    >
                        Vote
                    </button>
                )}
            </div>
        </li>
    )
}