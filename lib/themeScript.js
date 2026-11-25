// Runs before first paint so the saved light/dark choice never flashes.
export const THEME_SCRIPT = `try{var t=localStorage.getItem("aryo_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}`;
