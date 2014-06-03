$(function () {

  var mc = {};  // Memory Card
  mc.keys = {W: 87, S: 83, UP: 38, DOWN: 40, SPACE: 32};
  mc.width = parseInt($('.play-area').width());
  mc.height = parseInt($('.play-area').height());
  mc.gameOver = true;
  mc.winner = null;
  mc.padding = 5;
  mc.rowNum = 0;
  mc.columnsNum = 0;
  mc.cardsUseInGameList = [];
  mc.totalItemsCount = 52;
  mc.gameStarted = false;
  mc.startAt = "";
  mc.timer = "";

  $('#newGame').click(function () {
    newGame();
  });

  randomNumber = function () {
    var random;

    while (true) {
      random = Math.floor(Math.random() * 100);
      if (random < mc.totalItemsCount && random !== 0) {
        break;
      }
    }
    return random;
  }

  newGame = function () {
    mc.rowNum = $('#rowSize').val();
    mc.columnsNum = $('#columnSize').val();
    randomCardsUseInGame();
  }
  resetSize = function () {
    mc.rowNum = $('#rowSize').val();
    mc.columnsNum = $('#columnSize').val();
  }
  randomCardsUseInGame = function () {
    resetSize();
    for (var i = 0; i < mc.rowNum * mc.columnsNum / 2; i++) {
      var randomNumber = this.randomNumber();
      mc.cardsUseInGameList.push(randomNumber, randomNumber);
    };
    mc.cardsUseInGameList.shuffle();
    debug.info(mc.cardsUseInGameList.toString());
    initCards();
  }

  initCards = function () {
    var cardsEle = $('.cards');
    cardsEle.html('');

    for (var i = 0; i < mc.rowNum; i++) {
      var ulEle = document.createElement('ul');
      ulEle.id = 'cards-ul-' + i;
      cardsEle.append(ulEle);
      for (var j = 0; j < mc.columnsNum; j++) {
        var cardAttr = i + '-' + j;
        var cardId = 'card-' + cardAttr;
        var cardFrontClass = 'card_' + mc.cardsUseInGameList[mc.columnsNum * i + j];
        var cardItemEle = '<div class="card-item" id="' + cardId + '" attr=' + cardAttr + '>'
                + '<div class="card front flipped ' + cardFrontClass + '"><span class="front-text"></span></div>'
                + '<div class="card back flip card_back"><span class="back-text"></span></div>'
                + '</div>';
        $('#cards-ul-' + i).append('<li>' + cardItemEle + '</li>');
      };
    };

    mc.gameStarted = false;
    this.addClickEventListener();
  }
  refreshTimer = function () {
    var timestamp = (new Date().getTime() - mc.startAt);
    var millisecond = zeroPad(parseInt(timestamp % 1000), 3);
    timestamp /= 1000;
    var second = zeroPad(parseInt(timestamp % 60), 2);
    var minute = zeroPad(parseInt(timestamp / 60 % 60), 2);
    var hour = zeroPad(parseInt(timestamp / 60 / 60), 2);
    $('.time-spent').html(hour + ':' + minute + ':' + second + '.' + millisecond);
  }
  /**
   * [zeroPad description]
   * @param  {[Integer]} num The number waiting for convert
   * @param  {[Integer]} n The total length of the final num
   * @return {[Integer]}
   */
  zeroPad = function (num, n) {
    if ((num + '').length >= n) return num;
      return zeroPad('0' + num, n);
  }
  addClickEventListener = function () {
    $('.card-item').click(function () {
      if (!mc.gameStarted) {
        mc.gameStarted = true;
        mc.startAt = Date.parse(new Date());
        mc.timer = setInterval(refreshTimer, 30);
      }

      var attr = $(this).attr('attr');
      $('#card-' + attr + ' .front').toggleClass('flipped flip');
      $('#card-' + attr + ' .back').toggleClass('flip flipped');

      // $(this).children().each(function (index, element) {
      //   $(element).toggleClass('flip flipped')
      // });

      var flippedCards = $('.card.front.flip');
      if (flippedCards.length === 2) {
        var currentFlipCardAllFrontClass = $(this).children().attr('class');
        var currentFlipCardAllFrontClassArr = currentFlipCardAllFrontClass.split(' ');
        setTimeout(function () {
          checkCards(currentFlipCardAllFrontClassArr).then(
            function (response) {
              // success callback
              flippedCards = $('.card.front');
              if (flippedCards.length === 0) {
                clearInterval(mc.timer);
                mc.gameStarted = false;
                $('.time-spent').html('00:00：00:000');
              }
            },
            function (response) {
              // fail callback
              flippedCards.each(function (index,element) {
                $(element).parent().children().each(function (index,element) {
                  $(element).toggleClass('flipped flip');
                });
              });
            }
          )
        }, 800);
      }
    });
  }
  checkCards = function (currentFlipCardAllFrontClassArr) {
    var defer = $.Deferred();

    // find the correct card class
    var flippedCardFrontClass;
    for (var i = 0; i < currentFlipCardAllFrontClassArr.length; i++) {
      if (currentFlipCardAllFrontClassArr[i].indexOf('card_') !== -1) {
        flippedCardFrontClass = '.'+ currentFlipCardAllFrontClassArr[i];
        break;
      }
    };

    var flippedSameCardsCount = $('.card.front.flip' + flippedCardFrontClass).length;
    if (flippedSameCardsCount === 2) {
      $('.card.front.flip' + flippedCardFrontClass).each(function () {
        $(this).parent('.card-item').html('');
        defer.resolve();
      });
    } else {
        defer.reject();
    }

    return defer.promise();
  }
  window.addEventListener('keydown', function(e) {
      // space and arrow keys
      if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
      }
  }, false);

  continueRound = function (side) {
    if (mc.gameOver) {
      mc.gameOver = false;
      loop = setInterval(gameLoop, 30);
    }
  }

  checkStatus = function () {
    $('#playerAScore').html(mc.playerLeftScore);
    $('#playerBScore').html(mc.playerRightScore);
    if (mc.gameOver) {
      $('.newer-guide').show();
      $('.ball').css({'top': (mc.height - mc.ballHeight) / 2 + 'px', 'left': mc.width / 2 + mc.winner * 50});
      clearInterval(loop);
    }
  }

  Array.prototype.shuffle = function () { //v1.0
      for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
      return this;
  }

  randomCardsUseInGame();
});