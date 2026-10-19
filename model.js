export const ORIGINS = [{id:'pasila',label:'Pasilan asema'},{id:'rautatieasema',label:'Helsingin päärautatieasema'}];
export const DESTINATIONS = [{id:'meilahti',label:'Meilahti',zones:'AB'},{id:'kamppi',label:'Kamppi',zones:'AB'},{id:'airport',label:'Lentoasema',zones:'ABC'}];
export const STEPS = ['search','results','details','ticket','checkout','success'];
export const VALID_VIEWS = [...STEPS,'saved','case'];
export const DEFAULT_STATE = {view:'search',origin:'pasila',destination:'meilahti',time:'10:15',lessWalk:false,route:'balanced',ticket:'single'};
export function normalizeState(raw={}) {
  const state={...DEFAULT_STATE,...raw};
  if(!VALID_VIEWS.includes(state.view))state.view='search';
  if(!ORIGINS.some(x=>x.id===state.origin))state.origin=DEFAULT_STATE.origin;
  if(!DESTINATIONS.some(x=>x.id===state.destination))state.destination=DEFAULT_STATE.destination;
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(state.time))state.time=DEFAULT_STATE.time;
  state.lessWalk=state.lessWalk===true||state.lessWalk==='1';
  if(!['balanced','walkless','simple'].includes(state.route))state.route='balanced';
  if(!['single','day'].includes(state.ticket))state.ticket='single';
  return state;
}
export function stateFromHash(hash='') {
  const [view,query='']=hash.replace(/^#/,'').split('?');
  return normalizeState({view:view||'search',...Object.fromEntries(new URLSearchParams(query))});
}
export function hashFromState(raw) {
  const s=normalizeState(raw);const p=new URLSearchParams({origin:s.origin,destination:s.destination,time:s.time,route:s.route,ticket:s.ticket});
  if(s.lessWalk)p.set('lessWalk','1');
  return '#'+s.view+'?'+p.toString();
}
export function addMinutes(time,minutes) {const [h,m]=time.split(':').map(Number);const n=(h*60+m+minutes)%1440;return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
export function destinationFor(s) {return DESTINATIONS.find(x=>x.id===s.destination)||DESTINATIONS[0];}
export function originFor(s) {return ORIGINS.find(x=>x.id===s.origin)||ORIGINS[0];}
export function routesFor(raw) {
  const s=normalizeState(raw);const base=s.destination==='airport'?34:s.destination==='kamppi'?17:21;
  const adjustment=s.origin==='rautatieasema'?4:0;
  const items=[
    {id:'balanced',label:'Nopein esimerkki',minutes:base+adjustment,walk:550,changes:0,line:s.destination==='airport'?'J1':'B1',mode:s.destination==='airport'?'Juna':'Bussi',tone:'blue'},
    {id:'walkless',label:'Vähemmän kävelyä',minutes:base+adjustment+5,walk:180,changes:1,line:'B2',mode:'Bussi',tone:'teal'},
    {id:'simple',label:'Suora yhteys',minutes:base+adjustment+9,walk:800,changes:0,line:'R1',mode:'Raitiovaunu',tone:'purple'}
  ].map(r=>({...r,departure:s.time,arrival:addMinutes(s.time,r.minutes)}));
  return s.lessWalk?items.sort((a,b)=>a.walk-b.walk):items;
}
export function selectedRoute(s) {return routesFor(s).find(r=>r.id===s.route)||routesFor(s)[0];}
export function ticketFor(raw) {
  const s=normalizeState(raw);const z=destinationFor(s).zones;const day=s.ticket==='day';
  return {id:s.ticket,zones:z,name:day?'Vuorokausilippu':'Kertalippu',validity:day?'24 tuntia':'80 minuuttia',price:z==='ABC'?(day?12:4.8):(day?9:3.5)};
}
export const euro=n=>new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR'}).format(n);
export function reduceJourney(raw,action) {
  const s=normalizeState(raw);
  switch(action.type) {
    case 'SEARCH':{const next=normalizeState({...s,...action.values,view:'results'});next.route=routesFor(next)[0].id;return next;}
    case 'SELECT_ROUTE':return normalizeState({...s,route:action.id,view:'details'});
    case 'SELECT_TICKET':return normalizeState({...s,ticket:action.id});
    case 'NAVIGATE':return normalizeState({...s,view:action.view});
    case 'PAY_SUCCESS':return {...s,view:'success'};
    default:return s;
  }
}
