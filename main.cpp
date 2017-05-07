
#include <queue>
#include <functional>
#include <stdio.h>

#include "graph_work.h"

// If we aren't compiling to web assembly
// then make this a noop
#ifdef COMPILING_TO_WASM
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#include "fw.h"
#include <chrono>
#endif


std::priority_queue< int, std::vector<int>, std::greater<int> > Q;
Graph G;

extern "C" {

void EMSCRIPTEN_KEEPALIVE insert(int i) {
  Q.push(i);
}

int EMSCRIPTEN_KEEPALIVE top() {
  return Q.top();
}

void EMSCRIPTEN_KEEPALIVE pop() {
  return Q.pop();
}

void EMSCRIPTEN_KEEPALIVE bulkInsert(int N) {
  int j;
  for (int i = N; i > 0; --i) {
    Q.push(i);
    j = Q.top();
  }
}

int EMSCRIPTEN_KEEPALIVE bulkPops(int N) {
  int j;
  for (int i = 0; i < N; ++i) {
    j = Q.top();
    Q.pop();
  }

  return j;
}


void EMSCRIPTEN_KEEPALIVE initGraph(int N) {
    G.clear();
    G = Graph(N);
}

void EMSCRIPTEN_KEEPALIVE addEdge(int u, int v, int weight) {
  if (u >= boost::num_vertices(G) || v >= boost::num_vertices(G)) {
    return;
  }
  auto U = boost::vertex(u, G);
  auto V = boost::vertex(v, G);

  boost::add_edge(u, v, Weight(weight), G);
}

int EMSCRIPTEN_KEEPALIVE floydWarshall() {
  return doFloydWarshall(G);
}

} //extern

int main(int argc, char ** argv) {
    printf("In main\n");
    initGraph(4);
    addEdge(0, 1, 1);
    addEdge(0, 2, 2);
    addEdge(1, 2, 3);
    addEdge(2, 3, 5);
    std::cout << floydWarshall() << std::endl;

#ifndef COMPILING_TO_WASM
    std::chrono::microseconds ms;
    for (int i = 0; i < 100; ++i) {
      initGraph(100);
      constructGraph(100, 500);
      auto t1 = std::chrono::high_resolution_clock::now();
      floydWarshall();
      auto t2 = std::chrono::high_resolution_clock::now();
      ms = ms + std::chrono::duration_cast<std::chrono::microseconds>(t2 - t1);
    }
    std::cout << (ms.count()/1000)/100 << " millis";
#endif

}
