import {reply,options} from '@/lib/public-api';
export const OPTIONS=options;
export async function POST(req:Request){return reply(req,{error:'图片识别已停用。请刷新网页，点击日期设置上班、休息或自定义安排。'},410);}
