const defs = [
  ['graphics-cards','Graphics Cards','PC Components',['manufacturer','vramGB','powerW','architecture','rayTracing','upscaling','resolution']],
  ['processors','Processors','PC Components',['manufacturer','socket','cores','threads']],
  ['motherboards','Motherboards','PC Components',['socket','memoryType','formFactor','wifi']],
  ['ram','RAM','PC Components',['memoryType','capacityGB','frequencyMHz','modules','rgb']],
  ['storage','SSDs & Storage','PC Components',['capacityGB','interface','formFactor']],
  ['power-supplies','Power Supplies','PC Components',['powerW','efficiency','modular']],
  ['cases','PC Cases','PC Components',['formFactor','gpuClearanceMM','color']],
  ['cpu-coolers','CPU Coolers','PC Components',['coolerType','heightMM','socket']],
  ['case-fans','Case Fans','PC Components',['sizeMM','noiseDB','rgb']],
  ['gaming-mice','Gaming Mice','Gaming Peripherals',['weightG','maxDpi','wireless','connectivity','pollingRateHz','sensor','opticalSwitches','batteryLifeH','handSize','handedness','fps']],
  ['gaming-keyboards','Gaming Keyboards','Gaming Peripherals',['layout','switchType','wireless','formFactor','hotSwap','rapidTrigger','rgb']],
  ['gaming-headsets','Gaming Headsets','Gaming Peripherals',['wireless','connectivity','surround','microphone']],
  ['mousepads','Mousepads','Gaming Peripherals',['widthMM','heightMM','surface']],
  ['controllers','Gaming Controllers','Gaming Peripherals',['wireless','platform','connection']],
  ['microphones','Microphones','Gaming Peripherals',['connection','polarPattern','wireless']],
  ['webcams','Webcams','Gaming Peripherals',['resolution','fps','autofocus']],
  ['gaming-monitors','Gaming Monitors','Displays',['sizeIn','resolution','refreshRateHz','panel','responseMs','curved','hdr']],
  ['ultrawide-monitors','Ultrawide Monitors','Displays',['sizeIn','resolution','refreshRateHz','panel','curved']],
  ['oled-monitors','OLED Monitors','Displays',['sizeIn','resolution','refreshRateHz','panel','hdr']],
  ['gaming-chairs','Gaming Chairs','Gaming Furniture',['material','weightCapacityKG','adjustable']],
  ['gaming-desks','Gaming Desks','Gaming Furniture',['widthMM','depthMM','heightAdjustable']],
  ['monitor-arms','Monitor Arms','Gaming Furniture',['maxSizeIn','weightCapacityKG','mount']],
  ['lighting-accessories','Lighting & Accessories','Gaming Furniture',['type','connectivity','rgb']]
  ,['monitors','PC Monitors','Displays',['sizeIn','resolution','refreshRateHz','panel','responseMs']]
  ,['keyboards','PC Keyboards','Gaming Peripherals',['layout','switchType','wireless','formFactor']]
  ,['mice','PC Mice','Gaming Peripherals',['maxDpi','wireless','connectivity','handedness']]
  ,['headphones','Headphones & Headsets','Gaming Peripherals',['wireless','connectivity','microphone']]
  ,['speakers','PC Speakers','Gaming Peripherals',['configuration','powerW']]
  ,['audio-cards','Sound Cards','PC & Streaming Extras',['interface','chipset','channels']]
  ,['network-adapters','Network Adapters','PC & Streaming Extras',['interface','protocol']]
  ,['case-accessories','Case Accessories','PC & Streaming Extras',['accessoryType','formFactor']]
  ,['fan-controllers','Fan Controllers','PC & Streaming Extras',['channels','formFactor','pwm']]
  ,['thermal-compounds','Thermal Compounds','PC & Streaming Extras',['amountG']]
  ,['optical-drives','Optical Drives','PC & Streaming Extras',['interface']]
  ,['operating-systems','Operating Systems','PC & Streaming Extras',['bitness','maxMemoryGB']]
  ,['ups-systems','UPS Systems','PC & Streaming Extras',['capacityW','capacityVA']]
];
const labels = { manufacturer:'Manufacturer',vramGB:'VRAM (GB)',powerW:'Power (W)',rayTracing:'Ray tracing',resolution:'Resolution',architecture:'Architecture',upscaling:'Upscaling',socket:'Socket',cores:'Cores',threads:'Threads',memoryType:'Memory type',formFactor:'Form factor',wifi:'Wi-Fi',capacityGB:'Capacity (GB)',frequencyMHz:'Frequency (MHz)',modules:'Modules',rgb:'RGB',interface:'Interface',efficiency:'Efficiency',modular:'Modular',gpuClearanceMM:'GPU clearance (mm)',color:'Color',coolerType:'Cooler type',heightMM:'Height (mm)',sizeMM:'Size (mm)',noiseDB:'Noise (dB)',weightG:'Weight (g)',maxDpi:'Max DPI',wireless:'Wireless',connectivity:'Connectivity',pollingRateHz:'Polling rate (Hz)',batteryLifeH:'Battery life (hours)',sensor:'Sensor',opticalSwitches:'Optical switches',handSize:'Hand size',handedness:'Handedness',fps:'FPS suitable',layout:'Layout',switchType:'Switch type',hotSwap:'Hot-swappable',rapidTrigger:'Rapid Trigger',surround:'Surround sound',microphone:'Microphone',platform:'Platform',connection:'Connection',polarPattern:'Polar pattern',sizeIn:'Size (in)',refreshRateHz:'Refresh rate (Hz)',panel:'Panel',responseMs:'Response (ms)',curved:'Curved',hdr:'HDR',widthMM:'Width (mm)',surface:'Surface',weightCapacityKG:'Weight capacity (kg)',adjustable:'Adjustable',depthMM:'Depth (mm)',heightAdjustable:'Height adjustable',maxSizeIn:'Max screen size (in)',mount:'Mount',type:'Type',protocol:'Protocol',accessoryType:'Accessory type',channels:'Channels',pwm:'PWM support',amountG:'Amount (g)',bitness:'System bitness',maxMemoryGB:'Max memory (GB)',capacityW:'Capacity (W)',capacityVA:'Capacity (VA)'};
export const CATEGORIES = defs.map(([id,label,group,keys]) => ({ id,label,group,filters:keys.map(key=>({key,label:labels[key]||key,type:['wireless','rgb','wifi','rayTracing','curved','hdr','fps','hotSwap','rapidTrigger','modular','surround','microphone','autofocus','heightAdjustable','adjustable','opticalSwitches','pwm'].includes(key)?'boolean':['manufacturer','architecture','upscaling','sensor','handSize','resolution','connectivity','handedness','layout','switchType','panel','formFactor','memoryType','socket','protocol','interface','accessoryType'].includes(key)?'select':'number'})) }));
