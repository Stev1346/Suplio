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

export const lifecycleStatus = {
    lower: {
        draft: "draft",
        live: "live",
        ended: "ended",
        archived: "archived"
    },
    upper: {
        draft: "DRAFT",
        live: "LIVE",
        ended: "ENDED",
        archived: "ARCHIVED"
    },
    cased: {
        draft: "Draft",
        live: "Live",
        ended: "Ended",
        archived: "Archived"
    }
} as const;