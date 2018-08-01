//let squares = $('.square');
//squares.on('click', function() {});
//global variables

//array that keeps track of x's & o's
var origBoard,
    //var for human player
    humanPlayer = 'X',
    aiPlayer = 'O',
    winCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [6, 4, 2],
    ];

(function($) {

    let squares = $('.square'),
        mute = $('#mute')
        unmute = $('#unmute');
        gameWon = null;
        timeout = false;
        messages = $('.messages');
        message = $('.message');

    squares.on('click', turnClick);
    mute.on('click', muteSound);
    unmute.on('click', unMuteSound);

    $('#startGame').on('click', startGame);
    $('#quitGame').on('click', showSplash);
    $('#playAgain').on('click', startGame);

    var splashMusic = new Howl({
        src: 'sounds/splashScreen.mp3',
        autoplay: false,
        loop: true,
        volume: .3,
        onload: function() {
            splashMusic.fade(0, .3, 5000);
            splashMusic.once('fade', function() {});
        },
    });

    var gameMusic = new Howl({
        src: 'sounds/gamePlay.mp3',
        autoplay: false,
        loop: true,
        volume: .2,
    });

    var playerSound = new Howl({
        src: 'sounds/playerClick.mp3',
        autoplay: false,
        loop: false,
        volume: .4,
    });

    var computerSound = new Howl({
        src: 'sounds/computerClick.mp3',
        autoplay: false,
        loop: false,
        volume: .3,
    });

    var winSound = new Howl({
        src: 'sounds/win.mp3',
        autoplay: false,
        loop: false,
        volume: .3,
    });

    var lossSound = new Howl({
        src: 'sounds/loss.mp3',
        autoplay: false,
        loop: false,
        volume: .3,
    });

    showSplash();
    //toggle mute

    function unMuteSound(event) {
        event.preventDefault();
        unmute.removeClass('show');
        unmute.addClass('hide');
        mute.removeClass('hide');
        mute.addClass('display');
        Howler.mute(false);
    }

    function muteSound(event) {
        event.preventDefault();
        mute.removeClass('show');
        mute.addClass('hide');
        unmute.removeClass('hide');
        unmute.addClass('display');
        Howler.mute(true);
    }

    //code to animate header text
    $('.txt').html(function(i, html) {
        var chars = $.trim(html).split("");
        return '<span>' + chars.join('</span><span>') + '</span>';
    });

    function showSplash() {
        gameMusic.stop();
        splashMusic.play();
        $('.endGameContainer .endGame p').first().remove();
        $('.board').removeClass('opaque');
        $('.board').removeClass('show').addClass('hide');
        $('.endGameContainer').removeClass('show').addClass('hide');
        $('.splash').removeClass('hide').addClass('show');
        $('.messages').removeClass('show').addClass('hide');
    }

    function startGame(event) {
        event.preventDefault();
        gameMusic.stop();
        gameMusic.play();
        origBoard = Array.from(Array(9).keys());
        $('.square').html('');
        $('.board').removeClass('opaque');
        hideEndGame();
        hideSplash();
        squares.css('background-color', '').removeClass('blink_me');
        gameWon = null;
        squares.on('click', turnClick);
        timeout = false;
        $('.messages .message').html('Your Turn');
        $('.messages').removeClass('hide').addClass('show');
    }

    function hideSplash() {
        splashMusic.stop();
        $('.board').removeClass('hide').addClass('show');
        $('.splash').removeClass('show').addClass('hide');
    }

    function hideEndGame() {
        $('.endGameContainer').removeClass('show').addClass('hide');
    }

    function showEndGame(who) {

        $('.endGameContainer').removeClass('hide').addClass('show');
    }

    function turnClick(square) {

        // unless square is clicked on, the square contains a number, not an
        // x or an o, so you can use typeof to check if it's empty to keep player
        // from clicking on non empty cells.
        if (typeof origBoard[square.target.id] === 'number') {
            // spot is empty, so it can be played

            if (timeout === false) {
                turn(square.target.id, humanPlayer);
                squares.off();
            }  
            if (!checkWin(origBoard, humanPlayer) && !checkTie()) {
                // check for tie before allowing computer to go 
                turn(bestSpot(), aiPlayer);
                // ai picks the best spot
            }
        }
    }

    function turn(squareId, player) {
        //player can be computer or human
        //set the square with an x
        if (player === 'X') {
            $(`#${squareId}`).html('X');
            playerSound.play();
            origBoard[squareId] = player;
            let gameWon = checkWin(origBoard, player);
            //check for win
            // gameWon will contain the player and which row they won
            if (gameWon) {
              gameOver(gameWon);
              return;
            }
        }

        if (player === 'O' && gameWon === null) {
        // gameWon is null if there is a tie
        $('.messages .message').html('Computer\'s Turn');
            
            setTimeout(function() {
                timeout = true;
                origBoard[squareId] = player;
                let gameWon = checkWin(origBoard, player);
                $(`#${squareId}`).html('O');
                computerSound.play();
                
                if (gameWon) {
                    gameOver(gameWon);
                    return;
                }
                timeout = false;
                $('.messages .message').html('Your Turn');
                squares.on('click', turnClick);
            }, 1000);

        }
        origBoard[squareId] = player;

        


    }

    function checkWin(board, player) {
        // cant just reference global board because different versions of the
        //    board will be passed in

        let plays = board.reduce((a, e, i) =>
            (e === player) ? a.concat(i) : a, []);
        // cycle through every element of the board; 
        // accumulator(a) is initialized to an empty array; 
        // e(element) is the element of the board array that was passed in
        // i = the current index of the array
        // if an element in the board matches the player, the index is added to the new array
        // if the element doesn't match, just return the accumulator without adding
        //    anything to it
        //  basically just to find every index that the player has played in


        // if nobody wins, gameWon remains null

        //loop through the winCombos, and get the index and win array
        for (let [index, win] of winCombos.entries()) {
            // have to have index so you will know which win it was so you can highlight it
            //.every checks each element against a function. if the function returns
            // false, .every stops checking and returns false; if no false is returned
            // .every returns true  (doesn't change original array)
            // remember: win is an single array of the 3 elements in a given win 
            //           plays is all the places that player has played on the board; 
            if (win.every(elem => plays.indexOf(elem) > -1)) {
                // checks every 3 element possible win and if the player doesn't have a
                //    x on the board in EVERY element, it returns a negative 1
                // if plays.indexOf(elem) doesn't exist, -1 is returned

                //now, you know which set of squares the win is in,
                // and who the player is, you can return it to the caller
                // only returns if a player won
                gameWon = { index: index, player: player };
                // player won, no need to check other win possibilities, so break
                messages.removeClass('show').addClass('hide');
                break;
            }
        }
        return gameWon;
    }

    function gameOver(gameWon) {
      squares.off();
      timeout = true;
        for (let index of winCombos[gameWon.index]) {
            // get the index of the each element of the  win combo from the win combos
            // and use it to style to background color of the winning squares 
            gameWon.player === humanPlayer ?
                $(`#${index}`).addClass('blink_me').css('background-color', 'green') : 
                $(`#${index}`).css('background-color', 'red');
        }

        declareWinner(gameWon.player == humanPlayer ? "You win!" : "You lost!");
        gameWon.player == humanPlayer ? winSound.play() : lossSound.play();
    }

    function declareWinner(who) {

        $('.endGameContainer .endGame .text').text(who);
        $('.board').addClass('opaque');
        $('.endGameContainer').removeClass('hide').addClass('show');
    }

    function emptySquares() {
        return origBoard.filter(s => typeof s === 'number');
        // all numbered elements of origBoard represent unused squares
    }

    function bestSpot() {
        // different function for emptySquares because smarter ai will
        // be implemented 
        // also can be used to check tie
        // just return the first empty square (dumb)
        return emptySquares()[0];
    }

    function checkTie() {
        if (emptySquares().length === 0) {
            squares.each(function(element) {});
            // nobody has won yet and there are no empty squares = tie
            $('.squares').css('background-color', 'green');
            // color all the squares green

            // remove all the event listeners so the squares are inactive
            declareWinner("Tie Game!");
            lossSound.play();
            return true;
        }
        return false;
    }

    function disableClick() {
        let lis = $('.square')
        lis.each(function() {
            $(this).off('click');
        });
    }

    function enableClick() {
        squares.on('click', turnClick);
    }


})(jQuery);