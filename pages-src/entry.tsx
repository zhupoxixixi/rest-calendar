import React from 'react';
import {createRoot} from 'react-dom/client';
import CalendarClient from '../app/calendar-client';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<CalendarClient signedIn={true}/>);
