//DJ Routes
export const routes = {
    dj: {
        entry: "/dj",
        login: "/dj/login",
        signup: "/dj/signup",
        dashboard: "/dj/dashboard",
        events: "/dj/events",
        eventDetailByCode: (eventCode: string) => `/dj/events/${eventCode}`,
        profile: "/dj/profile",
        forgotPassword: "/dj/forgot-password",
        updatePassword: "/dj/update-password"
    },
    guest: {
        eventLanding: (eventCode: string) => `/event/${eventCode}`,
        scan: (eventCode: string) => `/event/${eventCode}/scan`,
        request: (eventCode: string) => `/event/${eventCode}/request`,
        vote: (eventCode: string) => `/event/${eventCode}/vote`,
    }
}

//Request constants
export const requestStatus = {
    lower: {
        accepted: "accepted",
        played: "played",
        pending: "pending",
        rejected: "rejected"
    },
    upper: {
        accepted: "ACCEPTED",
        played: "PLAYED",
        pending: "PENDING",
        rejected: "REJECTED"
    },
    cased: {
        accepted: "Accepted",
        played: "Played",
        pending: "Pending",
        rejected: "Rejected"
    }
} as const;

export const requestType = {
    lower: {
        songRequest: "song_request",
        karaoke: "karaoke",
    },
} as const;

//Lifecycle constants
export const lifecycleStatus = {
    lower: {
        draft: "draft",
        live: "live",
        ended: "ended",
        archived: "archived",
        all: "all",
        active: "active"
    },
    upper: {
        draft: "DRAFT",
        live: "LIVE",
        ended: "ENDED",
        archived: "ARCHIVED",
        all: "ALL",
        active: "ACTIVE"
    },
    cased: {
        draft: "Draft",
        live: "Live",
        ended: "Ended",
        archived: "Archived",
        all: "All",
        active: "Active"
    }
} as const;

export const EVENT_LIFECYCLE_STATUS = [
    lifecycleStatus.lower.draft,
    lifecycleStatus.lower.live,
    lifecycleStatus.lower.ended,
    lifecycleStatus.lower.archived] as const;

//Event constants
export const eventMode = {
    lower: {
        songRequest: "song_request",
        karaoke: "karaoke",
    },
    upper: {
        songRequest: "SONG_REQUEST",
        karaoke: "KARAOKE",
    },
    cased: {
        songRequest: "Song Request",
        karaoke: "Karaoke",
    },
} as const;

export const EVENT_MODES = [
    eventMode.lower.songRequest,
    eventMode.lower.karaoke,
] as const;

//Karaoke constants
export const karaokeRequestStatus = {
    lower: {
        queued: "queued",
        upNext: "up_next",
        performingNow: "performing_now",
    },
    cased: {
        queued: "Queued",
        upNext: "Up Next",
        performingNow: "Performing Now",
    },
} as const;

export const KARAOKE_REQUEST_STATUSES = [
    karaokeRequestStatus.lower.queued,
    karaokeRequestStatus.lower.upNext,
    karaokeRequestStatus.lower.performingNow,
] as const;