// [START app]
'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
// admin instance which can modify database
const firebaseAdmin = require('firebase-admin');
const firebaseEncode = require('firebase-encode');
firebaseAdmin.initializeApp(functions.config().firebase);

// API.AI actions
const ACTION_BOOKS_SHOW_INFO = 'books.more_info'
const ACTION_BOOKS_SHOW_INFO_BY_NAME = 'author.show_info.name'
const ACTION_AUTHOR_SHOW_INFO = 'author.show_info'

const BOOKS_DUMMY = {
    BOOK_FIRST: {
        key: 'BOOK_FIRST',
        name: 'Machine Learning',
        author: 'Hugh Howey',
        synopsis: 'This book is a new collection of stories, including some that have never before been seen, from the New York Times best-selling author of the Silo trilogy'
    },
    BOOK_SECOND: {
        key: 'BOOK_SECOND',
        name: 'Ironfoot',
        author: 'Dave Duncan',
        synopsis: 'This book about medieval magic, murder, and mayhem!'
    },
    BOOK_THIRD: {
        key: 'BOOK_THIRD',
        name: 'The Stone in the Skull',
        author: 'Elizabeth Bear',
        synopsis: 'The Stone in the Skull, the first volume in new trilogy, takes readers over the dangerous mountain passes of the Steles of the Sky and south into the Lotus Kingdoms.'
    }
}

const BOOK_AUTHORS_DUMMY = [
    {
        name: 'Hugh Howey',
        info: 'He is an American writer, known best for the science fiction series Silo, part of which he published independently through Amazon.com\'s Kindle Direct Publishing system.'
    },
    {
        name: 'Dave Duncan',
        info: 'He is an award-winning Scottish Canadian fantasy and science fiction author.'
    },
    {
        name: 'Elizabeth Bear',
        info: 'She is an American author who works primarily in speculative fiction genres, writing under the name Elizabeth Bear. '
    }
]

exports.devfest = functions.https.onRequest((request, response) => {
    console.log('Request headers: ' + JSON.stringify(request.headers))
    console.log('Request body: ' + JSON.stringify(request.body))

    // Construct actions app object, processing request
    const app = new App({ request, response })
    const actionMap = new Map()
    actionMap.set(ACTION_BOOKS_SHOW_INFO, bookSelected)
    actionMap.set(ACTION_BOOKS_SHOW_INFO_BY_NAME, bookSelectedByName)    
    actionMap.set(ACTION_AUTHOR_SHOW_INFO, authorInfoRequested)
    app.handleRequest(actionMap)

    function bookSelected(app) {
        const optionKey = app.getContextArgument('actions_intent_option', 'OPTION').value;
        
        app.setContext('books-last3-followup', 2, {
            book: BOOKS_DUMMY[optionKey].name,
            author: BOOKS_DUMMY[optionKey].author
        })
        console.log('Selected book' + JSON.stringify(optionKey) + ", " + JSON.stringify(app.getContexts()))
        // Compare the user's selections to each of the item's keys
        if (!optionKey) {
            app.ask('You did not select any item from the list or carousel');
        } else if (optionKey !== BOOKS_DUMMY[optionKey].key) {
            app.ask('You selected an unknown item from the list or carousel');
        } else {
            app.ask(BOOKS_DUMMY[optionKey].synopsis);
        }
    }

    function bookSelectedByName(app) {
        const bookName = app.getArgument('book');
        const findedBook = getArrayFromObject_(BOOKS_DUMMY).filter((dummyBook) => dummyBook.name.startsWith(bookName))[0]
        
        app.setContext('books-last3-followup', 2, {
            book: findedBook.name,
            author: findedBook.author
        })

        if (!bookName) {
            app.ask('I don\'t know about this book.');
        } else {
            app.ask(findedBook.synopsis);
        }
    }

    function authorInfoRequested(app) {
        var author = null;
        if (!app.getContextArgument('author-show_info', 'author_name')) {
            author = (app.getArgument('author_name') + " " + app.getArgument('author_last_name')).replace("null", "")
        } else {
            author = app.getContextArgument('author-show_info', 'author_name').value
        }
        const book = app.getArgument('book') || app.getContextArgument('author-show_info', 'book').value
        showInfoAboutAuthor(app, author, book)
    }

    function showInfoAboutAuthor(app, author, book) {
        console.log('authorInfoRequested: ' + author + ", book " + book)
        const findedAuthor = BOOK_AUTHORS_DUMMY.filter((dummyAuthor) => dummyAuthor.name.startsWith(author))[0]
        app.tell(findedAuthor.name + ". " + findedAuthor.info)
    }

    function getArrayFromObject_(obj) {
        if (!obj) return []
        return Object.keys(obj).map(key => {
            const childAtId = obj[key]
            childAtId.id = key
            return childAtId
        });
    }
});