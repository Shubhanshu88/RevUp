var POSITION_X_LEFT = -1;
var POSITION_X_MIDDLE = 1;
var POSITION_X_RIGHT = 3;
var camPos;

// CAMERA VARIABLES
var CAMW_TIME = 10000;
var CAMW_POS = {x:0,y:0,z:0};
var CAMW_MAX = {x:0,y:0,z:-1800};
var durTime = 180000;

var envCount = 1;
var envLen = -1000;

// ENV EXTEND
function extendEnv() {
  var oddCount = 1;
  var newEnvPos,envPath,envScene;
  if(envCount % 2 == 0) oddCount = 0;
  envCount++;
  newEnvPos = envCount * envLen - 480;
  if(oddCount == 1) {
    envPath = document.querySelector('.path-odd');
    envScene = document.querySelector('.env-odd');
  } else {
    envPath = document.querySelector('.path-even');
    envScene = document.querySelector('.env-even');
  }
  AFRAME.utils.entity.setComponentProperty(envPath,'position',`1 0 ${newEnvPos}`);
  AFRAME.utils.entity.setComponentProperty(envScene,'position',`0 0 ${newEnvPos}`);
}

// PLAYER CAMERA MOVEMENT

function cameraMove() {
  AFRAME.registerComponent('camera-move', {
    init: function() {
      console.log('wrapper success');
    },

    tick: function(time, timeDelta) {
      var curPos = this.el.object3D.position;
      camPos = curPos.z;
      if(curPos.z < (envCount * envLen)) {
        extendEnv();
      }
      checkObsCollision(camPos);
    }
  });
}

// Shift above
var ObsContainer;
var templateObsLeft;
var templateObsCenter;
var templateObsRight;
var numberOfObs = 0;
var templates;
var templatesDist;


// OBSTACLE SETUP

var ObsTimer;

function setupObs() {
  templateObsLeft =document.getElementById('template-obs-left');
  templateObsCenter =document.getElementById('template-obs-center');
  templateObsRight =document.getElementById('template-obs-right');

  console.log(camPos);
  ObsContainer = document.querySelector('#obs-container');

  templates = [templateObsLeft, templateObsCenter, templateObsRight];
  // console.log(AFRAME.utils.entity.getComponentProperty(templates[0],'position'));

  // console.log(AFRAME.utils.entity.getComponentProperty(templateObsLeft,'position'));
  templatesDist = templates.map(function(templateNode,index) { 
    newtemplateNode = templateNode.cloneNode(true);
    // console.log(AFRAME.utils.entity.getComponentProperty(newtemplateNode,'position'));
    return templateNode.cloneNode(true) ;
  });

  removeObs(templateObsCenter);
  // console.log(AFRAME.utils.entity.getComponentProperty(templatesDist[0],'position'))
  removeObs(templateObsLeft);
  removeObs(templateObsRight);
}

function cloneTemplate(arr) {
  templates[0].setAttribute('scale',{x:2,y:2,z:4});
  // console.log(templates[0]);
  // console.log(document.querySelector('#start-button'));
    templatesDist = arr.map(function(templateNode,index) {
      var newtemplateNode = templateNode.cloneNode(true);
      AFRAME.utils.entity.setComponentProperty(newtemplateNode,'position',`1 3 ${camPos - 10}`);
      return newtemplateNode;
    });
}

function addObsRandomlyLoop({intervalLength = 1200} = {}) {
  cloneTemplate(templatesDist);
  ObsTimer = setInterval(addObsRandomly,intervalLength);
}

function teardownObs() {
  clearInterval(ObsTimer);
}

function removeObs(obs_node) {
  obs_node.parentNode.removeChild(obs_node);
}

function addObs(el) {
  numberOfObs += 1;
  ObsContainer.appendChild(el);
}

function addObsTo(position_index) {

  // Configured for creating obs instead of cloning from DOM elements
  var node;
  switch(position_index) {
    case 0 : {
      node = createObs('left');
      break;
    }
    case 1 : {
      node = createObs('center');
      break;
    }
    case 2 : {
      node = createObs('right');
      break;
    }
    default : {
      console.log('no case for switch');
    }
  }

  addObs(node);
}

var probObsLeft;
var probObsCenter;
var probObsRight;
var maxNumberObs;

// Add obstacles randomly (currently < 3)
function addObsRandomly(
  {
    probObsLeft = 0.5,
    probObsCenter = 0.5,
    probObsRight = 0.5,
    maxNumberObs = 2
  } ={}) {
    var obs_array = [
      { probability: probObsLeft, position_index: 0 },
      { probability: probObsRight, position_index: 1 },
      { probability: probObsCenter, position_index: 2 },
    ];
    shuffle(obs_array);
    
    var numberOfObsAdded = 0;
    obs_array.forEach(function(obs_node) {
      if(Math.random() < obs_node.probability && numberOfObsAdded < maxNumberObs) {
        addObsTo(obs_node.position_index);
        numberOfObsAdded += 1;
      }
    });
    return numberOfObsAdded;

  }

// COLLISIONS

var POSITION_Z_OUT_OF_SIGHT = 1;
var POSITION_Z_LINE_START = 0.6;
var POSITION_Z_LINE_END = 0.7;
var obs_position_index;
var countInd = 0;

    function checkObsCollision(sight) {
      document.querySelectorAll('.obs').forEach(function(obs_node) {
        position = obs_node.getAttribute('position');
        console.log(position);
        obs_position_index = obs_node.getAttribute('data-obs-position-index');
        console.log(obs_position_index);

        if(position.z > sight + 2) {
          removeObs(obs_node);
          countInd += 1;
        }

        if (!isGameRunning) return 0;
        if((sight - 2) >= position.z && position.z > (sight - 3.5) && obs_position_index == player_position_index) {
          gameOver();
        }
      });
    }

// CONTROLS

var player_position_index = 1;

function movePlayer(position_index) {
  player_position_index = position_index;

  var position = {x:1,y:0.28,z:-2.8};

  if (position_index == 0) position.x = POSITION_X_LEFT;
  else if (position_index == 1) position.x = POSITION_X_MIDDLE;
  else position.x = POSITION_X_RIGHT;

  var player = document.getElementById('player-wagon');
  AFRAME.utils.entity.setComponentProperty(player, 'position', position);
}

function setupControls() {
  AFRAME.registerComponent('lane-controls', {
    tick: function(time, timeDelta) {
      var rotation =  this.el.object3D.rotation;

      if (rotation.y > 0.1) movePlayer(0);
      else if (rotation.y < -0.1) movePlayer(2);
      else movePlayer(1);
    }
  });
}

var distbtwObsCam = -24;

  // Function to create obstacles
function createObs(dir) {
  var pos = {x:1,y:0.8,z: camPos + distbtwObsCam};
  var ind;
  if(dir === 'left') {
    pos.x = -1;
    ind = 0;
  } else if (dir === 'center') {
    pos.x = 1;
    ind = 1
  } else if (dir === 'right') {
    pos.x = 3;
    ind = 2
  } else {
    console.log('No dir entered');
  }

    // Creating obstacle with rock mixin
    var obstacle = document.createElement('a-entity');
    obstacle.setAttribute('data-obs-position-index',ind);
    obstacle.setAttribute('class','obs');
    obstacle.setAttribute('shadow',true);
    obstacle.setAttribute('position', pos);
    obstacle.setAttribute('mixin','rock');
    obstacle.setAttribute('scale',{x:1.5,y:1.5,z:1.5});  
    return obstacle;
}

// INITIAL GAME CURSOR

function startCursor() {
  AFRAME.registerComponent('start-cursor', {
    init: function() {
      this.el.addEventListener('click', function(evt) {
        var cameraWrap = document.querySelector('.camera-wrapper');
        var obsCont = document.querySelector('#obs-container');
        var cw_animation = `property: position;to: ${CAMW_POS.x} ${CAMW_POS.y} ${CAMW_MAX.z};dur: ${durTime};
        easing:linear`
        AFRAME.utils.entity.setComponentProperty(cameraWrap,'position','0 0 0');
        setTimeout(() => {
          AFRAME.utils.entity.setComponentProperty(cameraWrap,'animation', cw_animation);
          AFRAME.utils.entity.setComponentProperty(obsCont,'animation', 
          `property: position;to: 0 0.5 ${CAMW_MAX.z * 2};dur: ${durTime}`);
        }, 500);
        setTimeout(() => {
          console.log(camPos);
          startGame();
        }, 3000);
      });
    }
  });
}

// UTILS

function shuffle(arr) {
  var currentIndex = arr.length;
  var temp;
  var randomIndex;
  while(0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex = currentIndex - 1;

    temp = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr [randomIndex] = temp;
  }

  return arr;
}


// START & END
function startGame() {
  if (isGameRunning) return;
  isGameRunning = true;

  addObsRandomlyLoop();
}

function gameOver() {
  isGameRunning = false;

  alert('Game Over! , Your Score: ' + countInd);
  teardownObs();
  entity.pause(); // Further - add code to restart after completing
}

// GAME

var isGameRunning = false;

// cameraSetup();
setupControls();
startCursor();
// Initialize camera track
cameraMove();

window.onload = function() {
  setupObs();
}