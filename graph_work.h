
#include <boost/graph/adjacency_list.hpp>
#include <boost/multi_array.hpp>
#include <boost/graph/floyd_warshall_shortest.hpp>
#include <string>
#include <utility>
#include <iostream>

typedef boost::adjacency_list<
    boost::listS, boost::vecS, boost::undirectedS,
    boost::no_property,
    boost::property<boost::edge_weight_t, int>
    > Graph;

typedef Graph::edge_property_type Weight;

int doFloydWarshall(Graph graph) {
  typedef boost::multi_array<int, 2> array_type;
  int N = boost::num_vertices(graph);
  array_type D(boost::extents[N][N]);

  boost::floyd_warshall_all_pairs_shortest_paths(graph, D);

  int largestD = 0;
  for (int i = 0; i < N; ++i) {
    for (int j = 0; j < N; ++j) {
      if (D[i][j] == std::numeric_limits<int>::max() || 
          D[i][j] == 0) {
        continue;
      }

      if (D[i][j] > largestD) {
        largestD = D[i][j];
      }
    }
  }
  return largestD;
}

void test() {
  Graph g(3);
  boost::graph_traits <Graph>::vertex_descriptor u, v, w;;
  u = boost::vertex(0, g);
  v = boost::vertex(1, g);
  w = boost::vertex(2, g);
  std::cout << boost::add_edge(u, v, Weight(2), g).first << std::endl;
  std::cout << boost::add_edge(v, w, Weight(4), g).first << std::endl;


  std::cout << boost::num_edges(g) << std::endl;
}

