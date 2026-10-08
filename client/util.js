import {rngTools} from '../shared/rng.js';

export const $=s=>document.querySelector(s);
export const rnd=Math.random;
export const {rr,ri,pick}=rngTools(rnd);
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export {fmt} from '../shared/rules.js';
