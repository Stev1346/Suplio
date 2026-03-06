type AppHeaderProps = {
    tagLine?: string;
}

export function AppHeader({tagLine = "Scan. Request. Vote."}: AppHeaderProps){
    return(
        <header className="mb-8">
            <h1 className="text-2xl font-bold">GotATune</h1>
            <p className="text-muted-500">{tagLine}</p>
        </header>
    );
}