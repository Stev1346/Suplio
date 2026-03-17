"use client";

import { NotFound } from "@/components/NotFound";
import { getRouteComponent } from "@/lib/routes";
import { useParams } from "next/navigation";

export default function AppPage(){
    const params = useParams();
    const slug = params.slug as string [] | undefined;
    const route = getRouteComponent(slug);

    if(!route){
        return <NotFound variant="page"/>;
    }

    const{Component } = route;
    
    return<Component />;
}