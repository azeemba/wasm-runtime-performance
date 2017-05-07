
#include <cmath>
#include <string>
#include "pi.h"

extern "C" {
void initGraph(int N);

void addEdge(int u, int v, int weight);

int floydWarshall();

}

int constructGraph(int NUM_NODES, int NUM_EDGES) {
  initGraph(NUM_NODES);

  int logNumNodes = log10(NUM_NODES);

  int next = -1;
  for (int i = 0; i < NUM_EDGES; ++i) {
    int cur = -1;
    if (next == -1) {
      std::string curStr;
      for (int j = 0; j < logNumNodes; ++j) {
        curStr += PI_MINUS_3[i*logNumNodes + j];
      }
      cur = std::stoi(curStr);
    }
    else {
      cur = next;
    }

    std::string nextStr;
    for (int j = 0; j < logNumNodes; ++j) {
      nextStr += PI_MINUS_3[(i+1)*logNumNodes + j];
    }
    next = std::stoi(nextStr);
    addEdge(cur, next, abs(cur-next));
  }
  return 0;
}
