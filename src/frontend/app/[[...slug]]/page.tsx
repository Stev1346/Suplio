"use client";

import { getRouteComponent } from "@/lib/routes";
import { useParams } from "next/navigation";

export default function AppPage(){
    const params = useParams();
    const slug = params.slug as string [] | undefined;
    const route = getRouteComponent(slug);

    if(!route){
        return(
            <div className="min-h-screen bg-primary-900 text-white p-6 flex items-center justify-center">
                <p className="text-muted-500">Page not found.</p>
            </div>
        );
    }

    const{Component, params: routeParams} = route;
    
    return<Component {...routeParams}/>;
}