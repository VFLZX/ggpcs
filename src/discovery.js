const spec = (product, key) => product.specs?.[key];
const numeric = value => value === '' || value == null || !Number.isFinite(Number(value)) ? null : Number(value);

export function searchProducts(products, query = '') {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return products;
  return products.filter(p => {
    const haystack = [p.name,p.brand,p.category,...Object.entries(p.specs || {}).flatMap(([k,v])=>[k,String(v)])].join(' ').toLowerCase();
    return terms.every(term => haystack.includes(term));
  });
}

export function filterProducts(products, category, filters = {}) {
  return products.filter(p => {
    if (category && p.category !== category) return false;
    const maxPrice = numeric(filters.maxPrice), minPrice = numeric(filters.minPrice);
    if (maxPrice !== null && (p.priceCHF == null || p.priceCHF > maxPrice)) return false;
    if (minPrice !== null && (p.priceCHF == null || p.priceCHF < minPrice)) return false;
    for (const [key, expected] of Object.entries(filters)) {
      if (['maxPrice','minPrice'].includes(key) || expected === '' || expected == null || (expected === false && key !== 'wireless')) continue;
      if (typeof expected === 'object' && ('min' in expected || 'max' in expected)) {
        const actual = spec(p,key);
        if (actual == null || !Number.isFinite(Number(actual)) || Number(actual)<expected.min || Number(actual)>expected.max) return false;
        continue;
      }
      if (key.startsWith('min')) {
        const actual = spec(p, key.slice(3,4).toLowerCase()+key.slice(4));
        if (actual == null || Number(actual) < Number(expected)) return false;
      } else if (key.startsWith('max')) {
        const actual = spec(p, key.slice(3,4).toLowerCase()+key.slice(4));
        if (actual == null || Number(actual) > Number(expected)) return false;
      } else if (spec(p,key) == null || String(spec(p,key)).toLowerCase() !== String(expected).toLowerCase()) return false;
    }
    return true;
  });
}

function valueScore(p) {
  const evidence = Object.entries(p.specs || {}).filter(([,v])=>typeof v==='number' && Number.isFinite(v)).length;
  if (!evidence || p.priceCHF == null || p.priceCHF <= 0) return {score:evidence ? 10 : 0, reasons:evidence ? ['Some specifications are listed; price is unavailable for value scoring.'] : []};
  return {score:Math.min(50, Math.round(evidence * 7 + 20 / Math.sqrt(p.priceCHF / 100))), reasons:[`${evidence} numeric specifications can be compared at CHF ${p.priceCHF}.`]};
}

function generationScore(product) {
  const s=product.specs||{},text=`${s.architecture||''} ${s.gpuChipset||''} ${product.model||''} ${product.name||''}`;
  if(product.category==='graphics-cards'){
    const nvidia=text.match(/(?:rtx|gtx)\s*(\d{4})/i);if(nvidia)return Math.min(12,Math.max(2,Math.floor(Number(nvidia[1].slice(0,2))/4)));
    const radeon=text.match(/rx\s*(\d{3,4})/i);if(radeon){const series=Number(radeon[1]);return Math.min(12,Math.max(3,Math.floor(series/750)))}
    if(/arc\s*b\d/i.test(text))return 11;if(/arc\s*a\d/i.test(text))return 8;
    const architecture=text.match(/blackwell|ada|ampere|turing|rdna\s*([23]?)/i);
    if(architecture){const name=architecture[0].toLowerCase();return name==='blackwell'?12:name==='ada'?11:name==='ampere'?9:name==='turing'?7:architecture[1]==='3'?10:architecture[1]==='2'?8:6}
  }
  if(product.category==='processors'){
    const ryzen=text.match(/ryzen\s+[3579]\s+(\d{4})/i);if(ryzen)return Math.min(12,Math.max(2,Number(ryzen[1][0])+3));
    const intel=text.match(/i[3579]-(\d{4,5})/i);if(intel)return Math.min(12,Math.max(2,Number(intel[1].slice(0,2))-2));
    if(/core\s+ultra\s+[3579]\s+\d{3}/i.test(text))return 12;
    const zen=text.match(/zen\s*([1-5])/i);if(zen)return Number(zen[1])+5;
  }
  return null;
}

export function rankProducts(products, useCase = 'overall') {
  const scored = products.map(product => {
    const {score:value,reasons} = valueScore(product);
    let score = value;
    const s = product.specs || {};
    if(product.category==='graphics-cards'){
      if(typeof s.vramGB==='number'){score+=Math.min(12,s.vramGB*.5);reasons.push(`Known VRAM: ${s.vramGB} GB.`)}
      if(typeof s.rayTracing==='boolean'){score+=s.rayTracing?4:0;reasons.push(`Ray tracing ${s.rayTracing?'is':'is not'} listed.`)}
      const generation=generationScore(product);if(generation!=null){score+=generation;reasons.push(`Model generation score: ${generation}.`)}
    } else if(product.category==='gaming-monitors'||product.category==='ultrawide-monitors'||product.category==='oled-monitors'){
      if(typeof s.refreshRateHz==='number'){score+=Math.min(15,s.refreshRateHz/30);reasons.push(`Refresh rate: ${s.refreshRateHz} Hz.`)}
      if(typeof s.responseMs==='number'){score+=Math.max(0,8-s.responseMs);reasons.push(`Response time: ${s.responseMs} ms.`)}
    } else if(product.category==='processors'){
      if(typeof s.cores==='number'){score+=Math.min(12,s.cores/2);reasons.push(`Known core count: ${s.cores}.`)}
      const generation=generationScore(product);if(generation!=null){score+=generation;reasons.push(`Model generation score: ${generation}.`)}
    }
    else if(product.category==='ram'&&typeof s.capacityGB==='number'){score+=Math.min(12,s.capacityGB/4);reasons.push(`Known memory capacity: ${s.capacityGB} GB.`)}
    if (/esport|fps|competitive/i.test(useCase)) {
      if (s.wireless === true) { score += 10; reasons.push('Wireless connectivity is confirmed.'); }
      if (s.weightG != null) { score += Math.max(0,15-Math.abs(s.weightG-55)/4); reasons.push(`Known weight: ${s.weightG} g.`); }
      if (s.pollingRateHz != null) { score += Math.min(20,s.pollingRateHz/400); reasons.push(`Known polling rate: ${s.pollingRateHz} Hz.`); }
    } else if (/performance|enthusiast/i.test(useCase)) {
      for (const k of ['refreshRateHz','vramGB','cores','capacityGB']) if (typeof s[k] === 'number') { score += Math.min(25,s[k]/4); reasons.push(`Known ${k}: ${s[k]}.`); }
    } else if (useCase === 'budget' && product.priceCHF != null) {
      score += Math.max(0,20 - product.priceCHF/20); reasons.push(`Listed price: CHF ${product.priceCHF}.`);
    }
    return {product,score:Math.round(score),reasons};
  }).sort((a,b)=>b.score-a.score);
  return scored.map((entry,i) => ({...entry,label:i===0 && entry.score>=35 ? (useCase==='budget'?'BEST BUDGET':/esport|fps|competitive/i.test(useCase)?'BEST FOR ESPORTS':/performance|enthusiast/i.test(useCase)?'BEST PERFORMANCE':useCase==='value'?'BEST VALUE':'BEST OVERALL') : null}));
}

export function sortProducts(products, key = 'value') {
  if (key==='performance') return rankProducts(products,'performance').map(x=>x.product);
  if (key==='value') return rankProducts(products,'overall').map(x=>x.product);
  return [...products].sort((a,b)=> {
    if (key === 'price-asc') return (a.priceCHF ?? Infinity)-(b.priceCHF ?? Infinity);
    if (key === 'price-desc') return (b.priceCHF ?? -Infinity)-(a.priceCHF ?? -Infinity);
    if (key === 'rating') return (b.rating ?? -Infinity)-(a.rating ?? -Infinity);
    if (key === 'name') return a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
}

export function rankAndSortProducts(products, focus = 'overall', sort = 'value') {
  if (sort==='value'||sort==='recommended') return rankProducts(products,focus).map(result=>result.product);
  return sortProducts(products,sort);
}

export function comparableBenchmarkTests(products) {
  const ids=[...new Set(products.flatMap(p=>(p.benchmarks||[]).map(b=>b.testId)))];
  return ids.flatMap(testId=>{
    const records=products.map(product=>(product.benchmarks||[]).find(item=>item.testId===testId)||null);
    const present=records.filter(Boolean);const directions=new Set(present.map(item=>item.direction));
    if(present.length<2||directions.size!==1)return [];
    return [{testId,direction:[...directions][0],scores:records.map(record=>record?.score??null),sources:records.map(record=>record?.source??null),testedAt:records.map(record=>record?.testedAt??null)}];
  });
}
