# Public catalog attribution

The built-in catalog transforms hardware fields and dated price observations into GameGear Hub's local schema. Product photos use the image URLs supplied by the PCPartPicker dataset and remain hosted by PCPartPicker; GameGear Hub does not rehost them. Original local vector illustrations appear when a product photo is missing or cannot load. Editorial notes and modeled performance indices are omitted. U.S. prices are not Swiss retail quotes; displayed CHF figures are conversions from the preserved USD source price.

## TechFuel HQ PC Builder Parts Dataset v2.1.1

- Dataset: [TechFuelHQ PC Builder Parts](https://techfuelhq.com/tools/pc-builder/)
- Source JSON: [GitHub](https://github.com/iBlessi/pc-builder-parts)
- License: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
- Required attribution: “TechFuelHQ PC Builder Parts Dataset (CC BY 4.0). https://techfuelhq.com/tools/pc-builder/”
- Data snapshot: 2026-09-29 correction; product-specific verification dates are retained in the catalog.

## CalculateBottleneck Hardware Reference Dataset v2.4.0

- Dataset: [Open PC Hardware & Compatibility Reference Dataset](https://calculatebottleneck.com/dataset)
- API data: [CPU reference](https://calculatebottleneck.com/api/dataset?type=cpu) and [GPU reference](https://calculatebottleneck.com/api/dataset?type=gpu)
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- Attribution: “CalculateBottleneck.com Hardware Reference Dataset (v2.4, September 2026)” — [dataset homepage](https://calculatebottleneck.com/dataset)
- Release date: 2026-09-29; retained platform and release year values are supplied per product where present.

## TweakGearPro PC Hardware Catalog 2026

- Dataset: [Hardware Coverage Dataset](https://tweakgearpro.com/datasets/hardware-coverage)
- Records: [structured 2026 catalog](https://tweakgearpro.com/data/tweakgearpro-hardware-2026.json)
- License: CC BY 4.0 (commercial reuse permitted; attribution required).
- Attribution: “TweakGearPro hardware dataset” — [dataset page](https://tweakgearpro.com/datasets/hardware-coverage)
- Retrieval date: 2026-08-29. Relative-performance tiers are omitted.

## Pricify weekly PC hardware prices — 2026-W45

- Dataset: [PC hardware prices: weekly open data](https://github.com/pricify-ai/pc-hardware-prices)
- License: CC BY 4.0. Required credit: “Pricify (pricify.ai)” with a link to [Pricify](https://pricify.ai).
- Price snapshot: 2026-11-02 through 2026-11-08, United States retailers; currencies are USD.
- Feeds: graphics cards, processors, SSDs, HDDs, RAM, and power supplies.
- The converted CHF figure uses the ECB USD/EUR and CHF/EUR reference rates for 2026-11-06. The underlying USD typical price is retained in each product record. Weekly prices and stock are historical U.S. market references.

## PCPartPicker Parts Dataset

- Dataset: [PCPartPicker Parts Dataset](https://huggingface.co/datasets/ThigasFS/pcpartpicker-parts-dataset)
- License: [MIT](https://huggingface.co/datasets/ThigasFS/pcpartpicker-parts-dataset)
- The catalog includes model records for CPUs, CPU coolers, motherboards, memory, storage, video cards, power supplies, and cases; some have no price in the snapshot.
- The 2026-10-06 local snapshot contains 26,914 unique models and the dataset's product-image URLs. Product photos are displayed from their original PCPartPicker host.
- Price snapshot: dataset last published 2026-10-06; EUR listing amounts from the France regional catalog. They are dated references, not live prices or Swiss quotes.
- CHF conversions use ECB CHF/EUR reference rate for 2026-10-06. Original EUR amounts, dataset publication date, and source link are retained.
- Product credit: “PCPartPicker Parts Dataset, by ThigasFS (MIT)” — [dataset card](https://huggingface.co/datasets/ThigasFS/pcpartpicker-parts-dataset).

## PC Part Dataset by docyx

- Dataset: [PC Part Dataset](https://github.com/docyx/pc-part-dataset)
- License: [MIT](https://github.com/docyx/pc-part-dataset/blob/main/LICENSE)
- The built-in catalog includes distinct PC component, display, audio, networking, storage, and gaming-peripheral records from the published 66,778-row dataset. Identical listings are merged; specification variants are retained.
- Source snapshot: July 23, 2025. Historical U.S. listing prices are preserved in USD and converted to CHF at 0.79345 CHF/USD using the ECB reference rates for July 23, 2025 (EUR/USD 1.1726; EUR/CHF 0.9306). They are dated reference prices and do not indicate current Swiss pricing or stock.
- Product credit: “PC Part Dataset by docyx (MIT)” — [dataset repository](https://github.com/docyx/pc-part-dataset).

## Monitor refresh-rate specifications

- The built-in monitor models retain their maker-listed maximum refresh rate in Hz when an exact or matching model source is available. Each monitor record links to its manufacturer specification page in the catalog.
- Sources include [Acer](https://www.acer.com/jp-ja/monitors/gaming/nitro-xv5/pdp/UM.HXXSJ.302), [AOC](https://ap.aoc.com/product/24G2), [ASUS ROG](https://rog.asus.com/monitors/27-to-31-5-inches/rog-swift-pg279qm-model/spec/), [BenQ](https://www.benq.com/en-ph/monitor/gaming/ex2510s/spec.html), [Dell](https://www.dell.com/en-us/shop/dell-27-gaming-monitor-g2724d/apd/210-bhxc/monitors-monitor-accessories), [Gigabyte](https://www.gigabyte.com/us/Monitor/M28U/sp), [LG](https://www.lg.com/us/monitors/lg-27gn800-b-gaming-monitor), [MSI](https://www.msi.com/Monitor/MAG-275QF/Specification), [Samsung](https://www.samsung.com/us/monitors/odyssey-gaming-monitors/compare/), and [ViewSonic](https://www.viewsonic.com/global/products/sheet/XG2431).
- These are technical specifications, not market prices. Variant-dependent models are only populated when the linked specification supports the catalog model.

## European Central Bank reference exchange rates

- API: [ECB Data Portal exchange rate API](https://data.ecb.europa.eu/help/api/data)
- Rates: daily USD and CHF values against EUR; used only to convert the dated USD retail reference price to CHF for display and budget filtering. ECB rates are reference rates, not transaction quotes.

This is a static catalog snapshot. It has no licensed live Swiss retail pricing feed. Digitec links open a search for the product name and do not imply a listing, stock status, or price. Product photos are only included for records whose source supplies them; other products use GameGear Hub vector illustrations.
