self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{let data={title:'休班提醒',body:'打开月历查看你的排班',url:'/'};try{Object.assign(data,event.data.json());}catch{}event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'/icon-192.png',badge:'/icon-192.png',tag:data.tag||'rest',data:{url:'/'}}));});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const window of windows){if(new URL(window.url).origin===self.location.origin){await window.focus();return;}}await self.clients.openWindow('/');})());});
