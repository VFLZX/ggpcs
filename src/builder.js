const shares = {gpu:.35,cpu:.20,motherboard:.12,ram:.09,storage:.08,psu:.08,case:.05,cooling:.03};
export function allocateBudget(total) {
  if (!Number.isFinite(total) || total < 0) throw new RangeError('Budget must be a non-negative number.');
  let used = 0;
  const entries = Object.entries(shares).map(([key,share],i,all)=>{
    const amount = i===all.length-1 ? total-used : Math.floor(total*share);
    used += amount; return [key,amount];
  });
  return Object.fromEntries(entries);
}

export function requiredPsuW(gpuPowerW, cpuPowerW, headroom = 1.5) {
  if (![gpuPowerW,cpuPowerW,headroom].every(Number.isFinite) || gpuPowerW < 0 || cpuPowerW < 0 || headroom < 1) return null;
  return Math.ceil((gpuPowerW + cpuPowerW) * headroom);
}

const compare = (name,a,b,relation) => {
  if (a == null || b == null) return {check:name,status:'unknown',detail:'Required specifications are missing.'};
  const ok = relation(a,b);
  return {check:name,status:ok?'compatible':'incompatible',detail:ok?'Known specifications match.':'Known specifications do not match.'};
};

const normalizeSocket=value=>String(value??'').toLowerCase().replace(/[^a-z0-9]/g,'');

export function cpuSocket(product) {
  if(product?.specs?.socket)return product.specs.socket;
  const model=`${product?.brand||''} ${product?.model||''} ${product?.name||''}`;
  const intel=model.match(/core\s+(?:i[3579]-|ultra\s+[3579]\s*)(\d{3,5})/i);
  if(intel){
    if(/core\s+ultra/i.test(model))return 'LGA1851';
    const digits=intel[1],generation=digits.length>=4?Number(digits.slice(0,2)):Number(digits[0]);
    if(generation>=12&&generation<=14)return 'LGA1700';
    if(generation===10||generation===11)return 'LGA1200';
    if(generation>=6&&generation<=9)return 'LGA1151';
    if(generation===4||generation===5)return 'LGA1150';
    if(generation===2||generation===3)return 'LGA1155';
  }
  const threadripper=model.match(/threadripper\s+(\d{4})/i);
  if(threadripper){const generation=Number(threadripper[1][0]);if(generation>=7)return 'sTR5';if(generation>=3)return 'sTRX4';if(generation>=1)return 'TR4'}
  const ryzen=model.match(/ryzen\s+[3579]\s+(\d{4})/i);
  if(ryzen){const generation=Number(ryzen[1][0]);if(generation>=7)return 'AM5';if(generation>=1&&generation<=5)return 'AM4'}
  return null;
}

function resolvedSpecs(part,product) {
  const specs={...(product?.specs||{})};
  if(part==='cpu'&&!specs.socket){const socket=cpuSocket(product);if(socket){specs.socket=socket;specs.socketInferred=true}}
  if(part==='motherboard'&&!specs.memoryType){
    const socket=normalizeSocket(specs.socket),name=`${product?.model||''} ${product?.name||''}`;
    if(socket==='am5'||socket==='lga1851'||/ddr5|\bd5\b/i.test(name))specs.memoryType='DDR5';
    else if(socket==='am4'||socket==='am3'||socket==='am3plus'||/ddr4|\bd4\b/i.test(name))specs.memoryType=socket==='am3'||socket==='am3plus'?'DDR3':'DDR4';
  }
  return specs;
}

export function checkCompatibility(parts = {}) {
  const {cpu={},motherboard={},ram={},gpu={},case:pcCase={},psu={},cooling={},requiredPowerW} = parts;
  return [
    (()=>{const result=compare('CPU socket',cpu.socket,motherboard.socket,(a,b)=>normalizeSocket(a)===normalizeSocket(b));if(cpu.socketInferred&&result.status==='compatible')result.detail=`${cpu.socket} inferred from processor model family; motherboard socket matches.`;return result})(),
    compare('CPU chipset support',motherboard.chipset,cpu.supportedChipsets??cpu.chipsets,(chipset,supported)=>Array.isArray(supported)?supported.some(item=>normalizeSocket(item)===normalizeSocket(chipset)):normalizeSocket(supported)===normalizeSocket(chipset)),
    compare('PCIe generation',gpu.pcieGeneration,motherboard.pcieGeneration,(gpuGen,boardGen)=>Number(String(gpuGen).match(/[\d.]+/)?.[0])<=Number(String(boardGen).match(/[\d.]+/)?.[0])),
    compare('RAM type',ram.memoryType,motherboard.memoryType,(a,b)=>normalizeSocket(a)===normalizeSocket(b)),
    compare('Memory speed',ram.frequencyMHz,motherboard.maxMemoryMHz,(speed,max)=>speed<=max),
    compare('Motherboard and case size',motherboard.formFactor,pcCase.supportedFormFactors??pcCase.formFactor,(form,supported)=>{
      const normalize=value=>String(value).toLowerCase().replace(/[^a-z0-9]/g,'');
      if(Array.isArray(supported))return supported.some(item=>normalize(item)===normalize(form));
      const board=normalize(form),enclosure=normalize(supported);
      if(enclosure===board)return true;
      if(/microatx|matx/.test(enclosure))return /microatx|matx|miniitx/.test(board);
      if(/miniitx/.test(enclosure))return /miniitx/.test(board);
      if(/eatx|extendedatx/.test(enclosure))return /eatx|extendedatx|atx|microatx|matx|miniitx/.test(board);
      if(/fulltower|midtower/.test(enclosure))return /eatx|extendedatx|atx|microatx|matx|miniitx/.test(board);
      if(/minitower/.test(enclosure))return /microatx|matx|miniitx/.test(board);
      if(/(^|[^e])atx/.test(enclosure))return /(^|[^e])atx|microatx|matx|miniitx/.test(board);
      return false;
    }),
    compare('GPU clearance',gpu.lengthMM,pcCase.gpuClearanceMM,(length,clearance)=>length<=clearance),
    compare('PSU wattage',requiredPowerW,psu.powerW,(need,available)=>available>=need),
    compare('CPU cooler socket',cpu.socket,cooling.supportedSockets,(socket,supported)=>Array.isArray(supported)?supported.some(item=>normalizeSocket(item)===normalizeSocket(socket)):normalizeSocket(supported)===normalizeSocket(socket)),
    compare('CPU cooler clearance',cooling.heightMM,pcCase.cpuCoolerClearanceMM,(height,clearance)=>height<=clearance)
  ];
}

const buildOrder = ['gpu','cpu','motherboard','ram','storage','psu','case','cooling'];

function compatibleSoFar(build) {
  const checks = compatibilityChecks(build);
  return !checks.some(check=>check.status==='incompatible');
}

function shortlist(ranked, limit=24) {
  if (ranked.length<=limit) return ranked;
  const picked = new Map();
  const add = item => picked.set(item.product.id,item);
  ranked.slice(0,10).forEach(add);
  const byPrice = [...ranked].sort((a,b)=>a.product.priceCHF-b.product.priceCHF);
  byPrice.slice(0,6).forEach(add);
  for (let i=1;i<=8;i++) add(byPrice[Math.round((byPrice.length-1)*i/9)]);
  return [...picked.values()];
}

/**
 * Build a complete, compatible parts list under one shared maximum budget.
 * `rankedParts` values are rankProducts() results for one component category.
 * Manual selections pin only their own slots; the rest are optimized around them.
 */
export function optimizeBuild(rankedParts, budget, weights={}, fixedSelections={}) {
  if (!Number.isFinite(budget) || budget < 0) throw new RangeError('Budget must be a non-negative number.');
  const parts = buildOrder.filter(part=>Array.isArray(rankedParts[part])&&rankedParts[part].length);
  const initial = {build:{},cost:0,quality:0};
  let states = [initial];

  for (const part of parts) {
    const ranked = rankedParts[part];
    const qualityById = new Map(ranked.map((item,index)=>[item.product.id,ranked.length<2?1:1-index/(ranked.length-1)]));
    const next = [];
    for (const state of states) {
      const fixed = fixedSelections[part] && ranked.find(item=>item.product.id===fixedSelections[part]);
      let possible=fixed?[fixed]:ranked;
      if(!fixed&&part==='motherboard'&&state.build.cpu){const socket=cpuSocket(state.build.cpu);if(socket)possible=possible.filter(item=>normalizeSocket(item.product.specs?.socket)===normalizeSocket(socket))}
      if(!fixed&&part==='ram'&&state.build.motherboard){const memoryType=resolvedSpecs('motherboard',state.build.motherboard).memoryType;if(memoryType)possible=possible.filter(item=>normalizeSocket(item.product.specs?.memoryType)===normalizeSocket(memoryType))}
      if(!fixed&&part==='psu'){
        const need=requiredPsuW(state.build.gpu?.specs?.powerW,state.build.cpu?.specs?.powerW);
        if(need!=null)possible=possible.filter(item=>item.product.specs?.powerW>=need);
      }
      const candidates=fixed?possible:shortlist(possible);
      for (const item of candidates) {
      const price = item.product.priceCHF;
      if (!Number.isFinite(price) || state.cost + price > budget + 0.005) continue;
      const build = {...state.build,[part]:item.product};
      if (!compatibleSoFar(build)) continue;
      const quality = qualityById.get(item.product.id)??0;
      next.push({build,cost:state.cost+price,quality:state.quality+quality*(weights[part]??1)});
      }
    }
    if (!next.length) {
      const partial=states.reduce((best,state)=>state.cost>best.cost?state:best,states[0]);
      return {build:partial.build,total:partial.cost,quality:partial.quality,checks:compatibilityChecks(partial.build),complete:false,withinBudget:true,missingParts:buildOrder.filter(slot=>!partial.build[slot])};
    }

    // Keep multiple high-quality routes at each spend level so early GPU/CPU
    // choices cannot consume the money needed for the remaining components.
    const bucketSize = Math.max(5,budget/60), buckets = new Map();
    for (const state of next) {
      const key = Math.floor(state.cost/bucketSize), bucket = buckets.get(key)||[];
      bucket.push(state); bucket.sort((a,b)=>b.quality-a.quality);
      const spendLeader = bucket.reduce((best,item)=>item.cost>best.cost?item:best,bucket[0]);
      const kept = bucket.slice(0,2);
      if (!kept.includes(spendLeader)) kept[2] = spendLeader;
      buckets.set(key,kept.slice(0,3));
    }
    states = [...buckets.values()].flat();
  }

  const closestSpend = Math.max(...states.map(state=>state.cost));
  const nearBudget = states.filter(state=>state.cost>=budget-Math.max(5,budget*0.01));
  const nearFullBudget = nearBudget.length?nearBudget:states.filter(state=>state.cost>=closestSpend-Math.max(5,budget*0.01));
  nearFullBudget.sort((a,b)=>b.quality-a.quality||b.cost-a.cost);
  const best = nearFullBudget[0]||states.reduce((a,b)=>b.cost>a.cost?b:a,states[0]);
  const checks = compatibilityChecks(best.build);
  return {build:best.build,total:best.cost,quality:best.quality,checks,complete:parts.length===buildOrder.length&&Object.keys(best.build).length===buildOrder.length,withinBudget:best.cost<=budget+0.005,missingParts:buildOrder.filter(slot=>!best.build[slot])};
}

function compatibilityChecks(build) {
  const chosen = Object.fromEntries(Object.entries(build).map(([part,product])=>[part,resolvedSpecs(part,product)]));
  const power = requiredPsuW(chosen.gpu?.powerW,chosen.cpu?.powerW);
  return checkCompatibility({
    cpu:chosen.cpu,motherboard:chosen.motherboard,ram:chosen.ram,
    gpu:{...chosen.gpu,lengthMM:chosen.gpu?.lengthMM??chosen.gpu?.length},
    case:{...chosen.case,gpuClearanceMM:chosen.case?.gpuClearanceMM},
    psu:chosen.psu,cooling:chosen.cooling,requiredPowerW:power
  });
}

