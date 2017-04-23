var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');
var spinnerElement = document.getElementById('spinner');

var Module = {
  preRun: [],
  postRun: [],
  print: (function() {
    var element = document.getElementById('output');
    if (element) element.value = ''; // clear browser cache
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      // These replacements are necessary if you render to raw HTML
      //text = text.replace(/&/g, "&amp;");
      //text = text.replace(/</g, "&lt;");
      //text = text.replace(/>/g, "&gt;");
      //text = text.replace('\n', '<br>', 'g');
      console.log(text);
      if (element) {
        element.value += text + "\n";
        element.scrollTop = element.scrollHeight; // focus on bottom
      }
    };
  })(),
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (0) { // XXX disabled for safety typeof dump == 'function') {
      dump(text + '\n'); // fast, straight to the real console
    } else {
      console.error(text);
    }
  },
  setStatus: function(text) {
    if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
    if (text === Module.setStatus.text) return;
    var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
    var now = Date.now();
    if (m && now - Date.now() < 30) return; // if this is a progress update, skip it if too soon
    if (m) {
      text = m[1];
      progressElement.value = parseInt(m[2])*100;
      progressElement.max = parseInt(m[4])*100;
      progressElement.hidden = false;
      spinnerElement.hidden = false;
    } else {
      progressElement.value = null;
      progressElement.max = null;
      progressElement.hidden = true;
      if (!text) spinnerElement.hidden = true;
    }
    statusElement.innerHTML = text;
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
  }
};
Module.setStatus('Downloading...');
window.onerror = function() {
  Module.setStatus('Exception thrown, see JavaScript console');
  spinnerElement.style.display = 'none';
  Module.setStatus = function(text) {
    if (text) Module.printErr('[post-exception status] ' + text);
  };
};

// Stuff above is copied almost entirely from
// minimal-shell.html from emsdk
// Stuff below is the actual code

function averageN(funs, times) {
  // heat up anything
  // so call all the functions
  funs.forEach(function(f) {
    f();
  });

  totalTimes = [0];
  totalTimes[funs.length] = 0;
  totalTimes.fill(0);

  for (var i = 0; i < times; ++i) {
    funs.forEach(function(f, index) {
      var start = performance.now();
      f();
      var stop = performance.now();
      totalTimes[index] += (stop - start);
    });
  }

  return totalTimes.map(function(time) { return time/times; });
}

function average2(fun1, fun2, times) {
  fun1Time = 0;
  fun2Time = 0;
  // heat up anything
  fun1();
  fun2();
  var j = 0;
  for (var i = 0; i < times; ++i) {
    var t0 = performance.now();
    fun1();
    var t1 = performance.now();
    fun1Time += t1 - t0;

    var t1 = performance.now();
    j = fun2();
    var t2 = performance.now();
    fun2Time += t2 - t1;
  }
  Module.print(j);
  return {
    first: fun1Time/times,
    second: fun2Time/times
  };
}

var runButton = document.getElementById('run');
runButton.addEventListener('click', function(e) {
  var option = document.getElementById('benchmark');
  if (option.value === 'priorityQueue') {
    priorityQueueBenchmark();
  }
  else if (option.value === 'floydWarshall') {
    floydWarshallBenchmark();
  }
});

function priorityQueueBenchmark() {
  var insert = Module.cwrap( 'insert', 'number', ['number']);
  var top = Module.cwrap( 'top', 'number', []);
  var pop = Module.cwrap( 'pop', 'number', []);
  var bulkInsert = Module.cwrap('bulkInsert', 'number', ['number']);
  var bulkPops = Module.cwrap('bulkPops', 'number', ['number']);

  var TIMES = 100;
  var N = 300000;

  Module.print("WASM:");
  var result = average2(
      function () {
        var j;
        for (var i = N; i > 0; --i) {
          insert(i);
          j = top();
        }
      },
      function() {
        var j = -1
        for (var i = 0; i < N; ++i) {
            j = top();
            pop();
        }
        return j;
      },
      TIMES);

  Module.print("On average, inserts of " + N + " elems took in ms: ",
      result.first);
  Module.print("On average, peek+pop of " + N +  " elems took in ms: ",
      result.second);
  Module.print(" ");
  
  Module.print("WASM Bulk Operations: ");
  result = average2(
      function() {
        bulkInsert(N);
      },
      function() {
        return bulkPops(N);
      },
      TIMES);
  Module.print("On average, inserts of " + N + " elems took in ms: ",
      result.first);
  Module.print("On average, peek+pop of " + N +  " elems took in ms: ",
      result.second);
  Module.print(" ");

 
  Module.print("FastPriorityQueue.js: ");

  var x = new FastPriorityQueue();
  result = average2(
      function() {
        var j;
        for (var i = N; i > 0; --i) {
          x.add(i);
          j = x.peek();
        }
      },
      function() {
        var j = -1
        for (var i = 0; i < N; ++i) {
            j = x.peek();
            x.poll();
        }
        return j;
      },
      TIMES);

  Module.print("On average, inserts of " + N + " elems took in ms: ",
      result.first);
  Module.print("On average, peek+pop of " + N +  " elems took in ms: ",
      result.second);
  Module.print(" ");
  
  Module.print("Heap.js: ");
  var h = new Heap();
  result = average2(
      function() {
        var j;
        for (var i = N; i > 0; --i) {
          h.push(i);
          j = h.peek();
        }
      },
      function() {
        var j = -1
        for (var i = 0; i < N; ++i) {
            j = h.peek();
            h.pop();
        }
        return j;
      },
      TIMES);
  Module.print("On average, inserts of " + N + " elems took in ms: ",
      result.first);
  Module.print("On average, peek+pop of " + N +  " elems took in ms: ",
      result.second);
  Module.print(" ");
}


function constructGraph(
    approxNumNodes, numEdges, createNodeFn, addEdgeFn) {

  // Assume PI_MINUS_3 
  var logOfNumNodes = Math.round(Math.log10(approxNumNodes));
  if (PI_MINUS_3.length < (numEdges+1)*logOfNumNodes) {
    Module.print("Not enough data to create edges");
    return;
  }

  // Suppose logOfNumNodes is 2, so we want
  // to create 2-digit nodes
  // So initialize 00, 01,...10, 11, ... 99
  for (var i = 0; i < Math.pow(10, logOfNumNodes); ++i) {
    var str = i.toString();
    var pad = logOfNumNodes - str.length;
    var nodeId = '0'.repeat(pad) + str;
    createNodeFn(nodeId);
  }

  var cur, next;
  for (var i = 0; i < numEdges; ++i)
  {
    // we read 141592.. as saying
    // there is an edge between node 14 and node 15
    // and an edge between node 15 and 92
    // assuming logOfNumNodes is 2
    if (!next) {
      cur = "";
      for (var j = 0; j < logOfNumNodes; ++j) {
        cur += PI_MINUS_3[i*logOfNumNodes + j];
      }
    }
    else {
      cur = next;
    }

    next = "";
    for (var j = 0; j < logOfNumNodes; ++j) {
      next += PI_MINUS_3[(i+1)*logOfNumNodes + j];
    }
    addEdgeFn(cur, next, Math.abs(cur - next));
  }
}


function floydWarshallBenchmark() {
  Module.print("floydWarshall");

  var NUM_NODES = 100;
  var NUM_EDGES = 500;


  var largest = 0;
  var avgTimes = averageN([function(){
    var g = new graphlib.Graph({directed: false});
    constructGraph(NUM_NODES, NUM_EDGES, g.setNode.bind(g), g.setEdge.bind(g));

    var more = graphlib.alg.floydWarshall(
        g,
        function(e){
          return g.edge(e);
        });
    Object.keys(more).forEach(function(key) {
      Object.keys(more[key]).forEach(function(innerKey) {
        if (more[key][innerKey].distance != Infinity &&
            more[key][innerKey].distance > largest) {
          largest = more[key][innerKey].distance 
        }
      });
    });
  }], 100);
  Module.print(
      "FloydWarshall in JS with V: " +
      NUM_NODES + " E: " + NUM_EDGES + " took in ms: " +
      avgTimes[0]);

  var initWAG= Module.cwrap( 'initGraph', 'number', []);
  var addEdgeFnWAG = Module.cwrap( 'addEdge', null, ['number', 'number', 'number']);
  var floydWarshallWAG = Module.cwrap( 'floydWarshall', 'number', []);

  var wasmLargest;
  var avgTimesWASM = averageN([function(){
    initWAG(NUM_NODES);
    constructGraph(
        NUM_NODES,
        NUM_EDGES,
        function() {},
        function(uStr, vStr, weight) {
          addEdgeFnWAG(parseInt(uStr, 10), parseInt(vStr, 10), weight);
        });
    wasmLargest = floydWarshallWAG();
  }], 100);
  Module.print(
      "FloydWarshall in WASM with V: " +
      NUM_NODES + " E: " + NUM_EDGES + " took in ms: " +
      avgTimesWASM[0]);
}
