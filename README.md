WebAssembly Runtime Performance
===========================

Note: A major benefit of WebAssembly is startup time as parsing of
wasm is more efficient than parsing JS. The work here doesn't take that into
account. It only looks at performance of actually executing the code after
everything is loaded.


### Heap/PriorityQueue Performance:

You can run the benchmark for this at:
 - [https://azeemba.github.io/wasm-runtime-performance/output/data_O3.html](https://azeemba.github.io/wasm-runtime-performance/output/data_O3.html) (optimized C++)
 - [https://azeemba.github.io/wasm-runtime-performance/output/data.html](https://azeemba.github.io/wasm-runtime-performance/output/data.html) (unoptimized)

Things being compared:

 - WASM based:
   - std::priority_queue with individual actions
   - std::priority_queue with bulk actions
 - [FastPriorityQueue.js](https://github.com/lemire/FastPriorityQueue.js)
 - [Heap.js](https://github.com/qiao/heap.js)

Here is a representative output at -O3 optimized level (smaller number is good):
```
In main
WASM:
On average, inserts of 300000 elems took in ms:  58.43675000000002
On average, peek+pop of 300000 elems took in ms:  39.92820000000006

WASM Bulk Operations: 
On average, inserts of 300000 elems took in ms:  51.98654999999981
On average, peek+pop of 300000 elems took in ms:  33.065599999999684

FastPriorityQueue.js: 
On average, inserts of 300000 elems took in ms:  9.860999999999585
On average, peek+pop of 300000 elems took in ms:  27.373649999999945

Heap.js: 
On average, inserts of 300000 elems took in ms:  13.4233500000001
On average, peek+pop of 300000 elems took in ms:  32.30655000000024
```
So it looks like web-assembly definitely does have a performance hit. 
Though surprisingly the behavior is a lot less significant when pop-ing the elements.


### Maintainence:

The wasm, html, js can be generated via `./generate_output.sh`


### To do:

Compare performance of other data structures and algorithms to get a better holistic view
