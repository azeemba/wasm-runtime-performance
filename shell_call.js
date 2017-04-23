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
  canvas: (function() {
    var canvas = document.getElementById('canvas');

    // As a default initial behavior, pop up an alert when webgl context is lost. To make your
    // application robust, you may want to override this behavior before shipping!
    // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
    canvas.addEventListener("webglcontextlost", function(e) { alert('WebGL context lost. You will need to reload the page.'); e.preventDefault(); }, false);

    return canvas;
  })(),
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

});

