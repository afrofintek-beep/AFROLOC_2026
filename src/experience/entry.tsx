import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Experience} from './Experience';
import './style.css';
// Isolated experience: no central-app auth, developer gallery or background GPS sampler.
createRoot(document.getElementById('root')!).render(<StrictMode><Experience/></StrictMode>);
