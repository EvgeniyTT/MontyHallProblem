var results;
var state;
var storage;
var resultTable;

const FIRST_CHOISE_WAIT = 1;
const SECOND_CHOISE_WAIT = 2;
const SECOND_CHOISE_MADE = 3;

function addRowToResultTable(rowObj) {0
  var row = document.createElement("TR");
  for (prop in rowObj) {
     var data = document.createElement("TD");
     data.innerHTML = rowObj[prop];
     row.appendChild(data);
   }
   resultTable.appendChild(row);
}

function populateResultTable() {
  while (document.querySelectorAll('table tr')[1]) {
    document.querySelector('table').deleteRow(1)
  }
  results.forEach( function(result) {
     addRowToResultTable(result)
  })
}

function populateTotal() {
  var totalPlayed = results.length;
  var totalChangedMind = 0;
  var totalWon = 0;
  var wonOnChange = 0;

  results.forEach(function(result) {
    if (result.firstChoise != result.secondChoise) {
      totalChangedMind++;
    }
    if (result.isWon) {
      totalWon++;
    }
    if (result.firstChoise != result.secondChoise && result.isWon) {
      wonOnChange++
    }
  });
  var wonOnStay = totalWon-wonOnChange;
  var totalStay = totalPlayed-totalChangedMind;

  $('span.played').text(totalPlayed);
  $('span.change').text(totalChangedMind);
  $('span.won').text(totalWon);
  $('span.wonOnChange').text(wonOnChange + " ("+ Math.round(wonOnChange/totalChangedMind*100) +"%)" );
  $('span.wonOnStay').text(wonOnStay + " ("+ Math.round(wonOnStay/totalStay*100) +"%)" );
}

function getRandomDoor(doorsList) {
  var selectedDoor = doorsList[Math.floor(Math.random() * doorsList.length)];
  return selectedDoor;
}

function placePrizes(dataObject) {
  var doorsArr = ["door1", "door2", "door3"];
  dataObject[getRandomDoor(doorsArr)] = "car";
  for (door in dataObject) {
    if (dataObject[door] == "") {
      dataObject[door] = "goat";
    }
  }
}

window.addEventListener( 'load', function() {

  resultTable = document.getElementsByName('result')[0];
  var dataObj;

  function closeTheDoors() {
    $('img[id="door1"]').attr("src","imgs/door1.png");
    $('img[id="door2"]').attr("src","imgs/door2.png");
    $('img[id="door3"]').attr("src","imgs/door3.png");
    $('img').addClass('close');
    $('img').removeClass('open');
  }

  function reset() {
    dataObj = {
      door1 : "",
      door2 : "",
      door3 : ""
    };
    state = FIRST_CHOISE_WAIT;
    $('div.ask').css("display","none");
    closeTheDoors();
    populateResultTable();
    populateTotal();
    placePrizes(dataObj);
  }

  function getFirstDoorToOpen(selectedDoor) {
    var doorsToOpen = [];
    for (door in dataObj) {
      if (door != selectedDoor && dataObj[door] == "goat") {
        doorsToOpen.push(door);
      }
    }
    return getRandomDoor(doorsToOpen);
  }

  function openDoor(door) {
    if (dataObj[door] == "goat") {
      $('img[id="'+ door +'"]').attr("src","imgs/koza.png");
    } else if (dataObj[door] == "car") {
      $('img[id="'+ door +'"]').attr("src","imgs/car.png");
    }
    $('img[id="'+ door +'"]').toggleClass("close open");
  }

  function askIsWantToPlay() {
    $('div.ask').css("display","block");
    $('button').click(function() {
        reset();
    })
  }

  storage = window.localStorage
   if (storage.getItem("montyTest")) {
     results = JSON.parse(storage.getItem("montyTest"));
   } else {
     results = [];
   }

   reset();

  $(".door").click(function(event) {
    if (state == FIRST_CHOISE_WAIT) {
      var selectedDoor = $(event.target).attr('id')
      var doorToOpen = getFirstDoorToOpen(selectedDoor);
      openDoor(doorToOpen);
      dataObj.firstChoise = selectedDoor;
      state = SECOND_CHOISE_WAIT;
    } else if (state == SECOND_CHOISE_WAIT) {
      var doorToOpen = $(event.target).attr('id');
      openDoor(doorToOpen);
      dataObj.secondChoise = doorToOpen;
      // CHANGE CHOISE?
      if (dataObj.firstChoise != dataObj.secondChoise) {
        dataObj.isChangeChoise = true;
      } else {
        dataObj.isChangeChoise = false;
      }
      // IS WON?
      if (dataObj[dataObj.secondChoise] == "car") {
        dataObj.isWon = true;
      } else {
        dataObj.isWon = false;
      }
      state = SECOND_CHOISE_MADE;

      //SAVE RESULT TO STORAGE
      results.push(dataObj);
      storage.setItem("montyTest",JSON.stringify(results));

      addRowToResultTable(dataObj);
      setTimeout(askIsWantToPlay, 500);

    }
  })

})
