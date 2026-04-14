
export const STORAGE_KEY = "gotatune_guest_cookie_notice_dismissed_v1";
const  listeners = new Set<() => void>();

export function subscribe(onStoreChange: () => void){
    listeners.add(onStoreChange);
    const onStorage = (e: StorageEvent) => {
        if(e.key === STORAGE_KEY || e.key === null) onStoreChange();
    };
    window.addEventListener("storage", onStorage);
    return ()=>{
        listeners.delete(onStoreChange);
        window.removeEventListener("storage",onStorage);
    } 
}

export function emitDismissalChange(){
    listeners.forEach((l) => l());
}

export function readDismissedFromStorage(): boolean{
    try{
        return window.localStorage.getItem(STORAGE_KEY) === "1";
    }
    catch{
        return false;
    }
}