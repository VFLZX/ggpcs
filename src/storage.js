const KEY = 'gamegear-hub-state-v1';
const initial = () => ({favorites:[],recent:[],comparison:[],targets:{},theme:'dark'});
export function readState(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return initial();
    return { ...initial(), ...parsed,
      favorites:Array.isArray(parsed.favorites)?parsed.favorites.filter(x=>typeof x==='string'):[],
      recent:Array.isArray(parsed.recent)?parsed.recent.filter(x=>typeof x==='string').slice(0,12):[],
      comparison:Array.isArray(parsed.comparison)?parsed.comparison.filter(x=>typeof x==='string').slice(0,4):[],
      targets:parsed.targets && typeof parsed.targets==='object'?parsed.targets:{},theme:parsed.theme==='light'?'light':'dark' };
  } catch { return initial(); }
}
export function writeState(state, storage = globalThis.localStorage) { try { storage?.setItem(KEY,JSON.stringify(state)); } catch {} }
export function toggleFavorite(state,id) { return {...state,favorites:state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id]}; }
export function addRecent(state,id) { return {...state,recent:[id,...state.recent.filter(x=>x!==id)].slice(0,12)}; }
export function addCompare(state,id) { if(state.comparison.includes(id)||state.comparison.length>=4)return state;return {...state,comparison:[...state.comparison,id]}; }
