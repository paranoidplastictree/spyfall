var games = [
    {
        "name": "Game 0",
        "location": "Airport",
        "playerCount": 3
    },
    {
        "name": "Game 1",
        "location": "Funeral Home",
        "playerCount": 5
    }
];

'use strict';

// Shortcuts to DOM Elements.
var gameForm = document.getElementById('game-form');
var gameTypeInput = document.getElementById('new-game-type');
var titleInput = document.getElementById('new-game-title');
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var addGame = document.getElementById('add-game');
var addButton = document.getElementById('add');
var currentGameSection = document.getElementById('current-game');
var gamesListSection = document.getElementById('games-list');
var currentGameMenuButton = document.getElementById('menu-current-game');
var gamesMenuButton = document.getElementById('menu-games');
var listeningFirebaseRefs = [];

/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
    // [START my_top_posts_query]
    var myUserId = firebase.auth().currentUser.uid;
    var allGamesRef = firebase.database().ref('games');
  
    var fetchPosts = function(gamesRef, sectionElement) {
        gamesRef.on('child_added', function(data) {
            var author = data.val().uid || 'Anonymous';
            var containerElement = sectionElement.getElementsByClassName('games-container')[0];
            containerElement.insertBefore(
            createGameElement(data.key, data.val().title, data.val().gameType, author),
            containerElement.firstChild);
        });
        gamesRef.on('child_changed', function(data) {
            var containerElement = sectionElement.getElementsByClassName('games-container')[0];
            var gameElement = containerElement.getElementsByClassName('game-' + data.key)[0];
            gameElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
            gameElement.getElementsByClassName('game-type')[0].innerText = data.val().gameType;
            gameElement.getElementsByClassName('player-count')[0].innerText = data.val().playerCount;
            gameElement.getElementsByClassName('spy-count')[0].innerText = data.val().spyCount;
        });
        gamesRef.on('child_removed', function(data) {
            var containerElement = sectionElement.getElementsByClassName('games-container')[0];
            var game = containerElement.getElementsByClassName('game-' + data.key)[0];
            game.parentElement.removeChild(game);
        });
    };
  
    // Fetching and displaying all posts of each sections.
    fetchPosts(gamesRef, gamesListSection);
    // fetchPosts(recentPostsRef, currentGameSection);
  
    // Keep track of all Firebase refs we are listening to.
    listeningFirebaseRefs.push(gamesRef);
    // listeningFirebaseRefs.push(recentPostsRef);
    // listeningFirebaseRefs.push(userPostsRef);
  }

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
    // Remove all previously displayed posts.
    gamesListSection.getElementsByClassName('games-container')[0].innerHTML = '';
    currentGameSection.getElementsByClassName('games-container')[0].innerHTML = '';
  
    // Stop all currently listening Firebase listeners.
    listeningFirebaseRefs.forEach(function(ref) {
      ref.off();
    });
    listeningFirebaseRefs = [];
  }

var currentUID;

function onAuthStateChanged(user) {
    // We ignore token refresh events.
    if (user && currentUID === user.uid) {
        return;
    }

    cleanupUi();
    if (user) {
        currentUID = user.uid;
        splashPage.style.display = 'none';
        writeUserData(user.uid, user.displayName, user.email, user.photoURL);
        startDatabaseQueries();
    } else {
        // Set currentUID to null.
        currentUID = null;
        // Display the splash page where you can sign-in.
        splashPage.style.display = '';
    }
}

/**
 * Creates a new post for the current user.
 */
function newPostForCurrentUser(title, text) {
    // [START single_value_read]
    var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
      var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
      // [START_EXCLUDE]
      return writeNewPost(firebase.auth().currentUser.uid, username,
        firebase.auth().currentUser.photoURL,
        title, text);
      // [END_EXCLUDE]
    });
    // [END single_value_read]
  }

/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
    recentPostsSection.style.display = 'none';
    userPostsSection.style.display = 'none';
    topUserPostsSection.style.display = 'none';
    addPost.style.display = 'none';
    recentMenuButton.classList.remove('is-active');
    myPostsMenuButton.classList.remove('is-active');
    myTopPostsMenuButton.classList.remove('is-active');
  
    if (sectionElement) {
      sectionElement.style.display = 'block';
    }
    if (buttonElement) {
      buttonElement.classList.add('is-active');
    }
  }

/* Element Variables */
var uidLabel = document.getElementById("userid");
var accountWrapper = document.getElementById("account");
var gameWrapper = document.getElementById("games")

/* UI Functions */
function toggleLoggedIn(loggedIn) {
    if (loggedIn) {
        accountWrapper.classList.add("logged-in");
    }
    else {
        accountWrapper.classList.remove("logged-in");
    }
}

/* Games CRUD */
function displayGames() {

}

function createGame(uid, title, gameType) {
    var gameData = {
        uid: uid,
        title: title,
        gameType: gameType,
        playerCount: 0
    };

    // Get a key for a new game.
    var newGameKey = firebase.database().ref().child('games').push().key;

    // Write the new game data in the games list.
    var updates = {};
    updates['/games/' + newGameKey] = gameData;

    return firebase.database().ref().update(updates);
}

function removeGame(gameId) {

}

function joinGame(gameId) {

}

window.addEventListener('load', function () {
    // Bind Sign in button.
    signInButton.addEventListener('click', function () {
        firebase.auth().signInAnonymously().catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            uidLabel.textContent = errorMessage;
        });
    });

    // Bind Sign out button.
    signOutButton.addEventListener('click', function () {
        firebase.auth().signOut();
    });

    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            var isAnonymous = user.isAnonymous;
            currentUID = user.uid;
            uidLabel.textContent = currentUID;
            toggleLoggedIn(true);
        } else {
            // User is signed out.
            // ...
            toggleLoggedIn(false);
        }
        // ...
    });

    // Saves message on form submit.
    messageForm.onsubmit = function (e) {
        e.preventDefault();
        var text = messageInput.value;
        var title = titleInput.value;
        if (text && title) {
            newPostForCurrentUser(title, text).then(function () {
                myPostsMenuButton.click();
            });
            messageInput.value = '';
            titleInput.value = '';
        }
    };

    // Bind menu buttons.
    recentMenuButton.onclick = function () {
        showSection(recentPostsSection, recentMenuButton);
    };
    myPostsMenuButton.onclick = function () {
        showSection(userPostsSection, myPostsMenuButton);
    };
    myTopPostsMenuButton.onclick = function () {
        showSection(topUserPostsSection, myTopPostsMenuButton);
    };
    addButton.onclick = function () {
        showSection(addPost);
        messageInput.value = '';
        titleInput.value = '';
    };
    recentMenuButton.onclick();
}, false);