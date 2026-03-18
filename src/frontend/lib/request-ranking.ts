import {RequestRow} from "@/lib/requests";

export function compareRankedRequests(a:RequestRow, b:RequestRow){
    return (
        b.votes - a.votes ||
        a.created_at.localeCompare(b.created_at)||
        a.song_name.localeCompare(b.song_name)
    );
}