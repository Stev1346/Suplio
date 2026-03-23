export const routes = {
    dj: {
        entry:"/dj",
        login: "/dj/login",
        signup: "/dj/signup",
        dashboard: "/dj/dashboard",
        events: "/dj/events",
        eventDetail: (eventId: string) => `/dj/events/${eventId}`,
        profile: "/dj/profile"
    },
    guest:{
        eventLanding: (eventCode: string) => `/event/${eventCode}`,
        scan: (eventCode: string) => `/event/${eventCode}/scan`,
        request: (eventCode: string) => `/event/${eventCode}/request`,
        vote: (eventCode: string) => `/event/${eventCode}/vote`,
    }
}