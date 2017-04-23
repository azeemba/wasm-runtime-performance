#!/bin/bash

# Generate unoptimized version
emcc main.cpp -o output/data.html -s EXPORTED_FUNCTIONS="['_top', '_insert', '_pop', '_main', '_bulkInsert', '_bulkPops']" -s WASM=1 --shell-file  shell_call.html


# Generate optimized version
emcc main.cpp -o output/data_O3.html -O3 -s EXPORTED_FUNCTIONS="['_top', '_insert', '_pop', '_main', '_bulkInsert', '_bulkPops']"  -s WASM=1 --shell-file  shell_call.html

