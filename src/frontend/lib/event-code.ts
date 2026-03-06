const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789';

export function generateEventCode(length = 8): string {
    let code ='';
    for(let i=0; i< length; i++){
        code+=CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
}