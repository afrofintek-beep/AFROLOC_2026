import {createRoot} from 'react-dom/client';
import {YamilookExperience} from './Experience';
import '../experience/style.css';
import {loadExperienceLocale} from './i18n';
void loadExperienceLocale(new URLSearchParams(window.location.search).get('lang')).then(()=>{
 createRoot(document.getElementById('root')!).render(<YamilookExperience/>);
});
