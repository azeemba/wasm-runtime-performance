
#include <queue>
#include <functional>
#include <stdio.h>

std::priority_queue< int, std::vector<int>, std::greater<int> > Q;
extern "C" {

void insert(int i) {
  Q.push(i);
}

int top() {
  return Q.top();
}

void pop() {
  return Q.pop();
}

void bulkInsert(int N) {
  int j;
  for (int i = N; i > 0; --i) {
    Q.push(i);
    j = Q.top();
  }
}

int bulkPops(int N) {
  int j;
  for (int i = 0; i < N; ++i) {
    j = Q.top();
    Q.pop();
  }

  return j;
}

}

int main(int argc, char ** argv) {
    printf("In main\n");
}
