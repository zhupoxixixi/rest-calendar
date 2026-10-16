import CalendarClient from './calendar-client';
import { getChatGPTUser } from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();return <CalendarClient signedIn={!!user}/>;}
