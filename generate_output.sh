#!/bin/bash

# Generate unoptimized version
emcc main.cpp -o output/data.html -D COMPILING_TO_WASM -s WASM=1 --shell-file  shell_call.html -I/home/azeem/temp/include -std=c++11


# Generate optimized version
emcc main.cpp -o output/data_O3.html -O3 -D COMPILING_TO_WASM -s WASM=1 --shell-file  shell_call.html -I/home/azeem/temp/include/ -std=c++11

