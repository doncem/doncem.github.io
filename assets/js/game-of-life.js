function CONWAYrequestInterval(fn, delay) {
    var start = new Date().getTime();
    var handle = {};
  
    function loop() {
      // TODO wrap with loop check
      handle.value = requestAnimationFrame(loop);
      var current = new Date().getTime();
  
      if (current - start >= delay) {
        fn.call();
        start = new Date().getTime();
      }
    }
  
    handle.value = requestAnimationFrame(loop);
  
    return handle;
}
  
function CONWAYcreateArray(rows) {
    var arr = [];
  
    for (var i = 0; i < rows; i++) {
      arr[i] = [];
    }
  
    return arr;
}

var gameOfLife = function() {
    const LIFE_SIZE = 50;
      const LIFE_SKIP = 1;
      const DELAY = 1000;
      const FILL_COLOUR = '#FF0000';

      document.body.style.overflow = 'hidden';
      tmpContainer = document.getElementById('game-of-life-container');
      tmpContainer.width = window.innerWidth;
      tmpContainer.height = window.innerHeight;
      tmpContainer.style.display = 'block';
      tmp = document.getElementById('game-of-life-canvas');
      tmp.width = tmpContainer.width;
      tmp.height = tmpContainer.height;

      var c = document.getElementById('game-of-life-canvas');
      var gridHeight = c.height / LIFE_SIZE;
      var gridWidth = c.width / LIFE_SIZE;
      var gridHeightIter = Math.floor(gridHeight);
      var gridWidthIter = Math.floor(gridWidth);
      var theGrid = CONWAYcreateArray(gridWidthIter);
      var mirrorGrid = CONWAYcreateArray(gridWidthIter);
      var ctx = c.getContext('2d');
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = FILL_COLOUR;
      var iteration = 0;
  
      function tick() {
          console.time('loop');
          drawGrid();
          updateGrid();
          console.timeEnd('loop');
          iteration++;
      }
  
      function fillRandom() {
          var gap = Math.min(LIFE_SKIP, Math.floor(gridHeightIter / 4), Math.floor(gridHeightIter / 4));
  
          for (var j = gap; j < gridHeightIter - gap; j++) { //iterate through rows
              for (var k = gap; k < gridWidthIter - gap; k++) { //iterate through columns
                  theGrid[j][k] = Math.round(Math.random());
              }
          }
      }
  
      function drawGrid() {
          var liveCount = 0;
  
          for (var j = 0; j < gridHeightIter; j++) { //iterate through rows
              for (var k = 0; k < gridWidthIter; k++) { //iterate through columns
                  if (theGrid[j][k] === 1) {
                      ctx.fillRect(k * LIFE_SIZE, j * LIFE_SIZE, LIFE_SIZE, LIFE_SIZE);
                      liveCount++;
                  } else {
                      ctx.clearRect(k * LIFE_SIZE, j * LIFE_SIZE, LIFE_SIZE, LIFE_SIZE);
                  }
              }
          }
  
          console.log('iteration: ' + iteration + '; life count: ' + liveCount);
      }
  
      function updateGrid() {
          for (var j = 1; j < gridHeightIter - 1; j++) { //iterate through rows
              for (var k = 1; k < gridWidthIter - 1; k++) { //iterate through columns
                  var totalCells = 0;
  
                  totalCells += theGrid[j - 1][k - 1];
                  totalCells += theGrid[j - 1][k];
                  totalCells += theGrid[j - 1][k + 1];
  
                  totalCells += theGrid[j][k - 1];
                  totalCells += theGrid[j][k + 1];
  
                  totalCells += theGrid[j + 1][k - 1];
                  totalCells += theGrid[j + 1][k];
                  totalCells += theGrid[j + 1][k + 1];
  
                  switch (totalCells) {
                      case 2:
                          mirrorGrid[j][k] = theGrid[j][k];
  
                          break;
                      case 3:
                          mirrorGrid[j][k] = 1;
  
                          break;
                      default:
                          mirrorGrid[j][k] = 0;
                  }
              }
          }
  
          //mirror edges to create wraparound effect
          // TODO figure out minus 2s. why?
          for (var l = 0; l < gridHeightIter - 2; l++) { //iterate through rows
              //top and bottom
              mirrorGrid[l][0] = mirrorGrid[l][gridWidthIter - 2];
              mirrorGrid[l][gridWidthIter - 1] = mirrorGrid[l][1];
          }
          for (var l = 0; l < gridWidthIter - 2; l++) {
              //left and right
              mirrorGrid[0][l] = mirrorGrid[gridHeightIter - 2][l];
              mirrorGrid[gridHeightIter - 1][l] = mirrorGrid[1][l];
  
          }
  
          //swap grids
          var temp = theGrid;
          theGrid = mirrorGrid;
          mirrorGrid = temp;
      }
  
      // run
      fillRandom();
      CONWAYrequestInterval(tick, DELAY);
};