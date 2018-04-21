/*
  Singleton - creates a single instance of Library object
    returns:
      instance of Library object
*/
var library;
( function () {

    var lib_instance;

    library = function(name) {
        if (lib_instance) {
            return lib_instance;
        }
        lib_instance = this;
        this.name = name;
    };
}());

library.prototype.books = [];

/*
  addBook -  adds a book to the Library
    returns:
      false - if duplicate title is found and nothing added
      true - if book was not in library and has been added
*/
library.prototype.addBook = function (book) {
    if (book == null) {
        return false;
    } else if (this.books.length !== 0) {
        if (this.books.every(isTitleUnique)) {
            this.books.push(book);
            return true;
        } else {
            return false;
        }
    } else {
        this.books.push(book);
        return true;
    }

    function isTitleUnique(bookToAdd) {
        return bookToAdd.title.toLowerCase() !== book.title.toLowerCase();
    }
};

/*
  removeBookByTitle -  Remove a book if title exactly matches book title
    returns:
      false - if a book was not removed
      true - if a book was removed
*/
library.prototype.removeBookByTitle = function (title) {
    var notDeletedBooks = [];
    var hasDeletedBook = false;
    if (title !== null) { // title not a valid input
        this.books.forEach( function(book) { // walk through the library
            if (book.title == title) {
                hasDeletedBook = true;
            } else {
                notDeletedBooks.push(book);
            }
        });
        this.books = notDeletedBooks;
    }
    return hasDeletedBook;
};

/*
  removeBooksByAuthor - Remove all books if authorName exacly matches Book's author from the library
    returns
      true - if book(s) were removed
      false - if no books matched
*/
library.prototype.removeBooksByAuthor = function (authorName) {

    var hasDeletes = false;     // true if any books had to be deleted
    var notDeletedBooks= [];    // new array with all undeleted books
    if (authorName !== null) {
        this.books.forEach( function(book) { // walk through all the books in the library
            if (authorName !== book.author) { // look for an exact match
                notDeletedBooks.push(book);
            } else {
                hasDeletes = true;
            }
        });
    } else {
        return false;
    }
    this.books = notDeletedBooks;
    return hasDeletes;
};

/*
  getRandomBook - returns a random book from the library
    returns:
      null - if no books in library
      Book object - if library has books
*/
library.prototype.getRandomBook = function () {

    var i; // random index into array of books
    if ((typeof Array != "undefined") && (this.books.length != 0)) {
        i = Math.floor(Math.random() * this.books.length);
        return this.books[i];
    } else {
        return null;
    }
};

/*
  getBookByTitle - Returns all books that completely or partially matches the string title passed into the function

  returns:
    array of Book object(s) if the title either totally or partially matches book title(s)
    null array if no books are found
*/
library.prototype.getBookByTitle = function (title) {
    var foundBooks = [];
    if (title !== null) {
        var regex = new RegExp(title, "i");
        this.books.forEach( function (book) {
            if (regex.test(book.title)) {
                foundBooks.push(book);
            }
        });
    }
    return foundBooks;
};

/*
  get BooksByAuthor - Finds all books where the author’s name partially or completely matches the authorName argument
    returns:
      array of Book objects, can be empty if no book is found matching the search parameters
*/
library.prototype.getBooksByAuthor = function (authorName) {

    var foundBooks = [];
    if (authorName !== null) {
        var regex = new RegExp(authorName, "i");
        this.books.forEach(function(book) {
            if (regex.test(book.author)) {    // returns true if authorName is found anywhere in string, ignores case
                foundBooks.push(book);
            }
        });
    }
    return foundBooks;
};

/*
  addBooks -  adds an array of Book objects to the library
    returns:
      number of books added to library

*/
library.prototype.addBooks = function (books) {

    var _this = this;
    var isBookAdded = false;
    var addedCounter = 0;
    books.forEach( function (book) {
        isBookAdded = _this.addBook(book);
        if (isBookAdded) {
            ++addedCounter;
        }
    });
    return addedCounter;
};

/*
  getAuthors - Find the distinct authors’ names from all books in your library
    returns:
      empty array - if nothing is found.
      array of strings - each string an unique author's name
*/
library.prototype.getAuthors = function () {
    var authors = [];             // Array of authors in library
    var author;                   // name of current author
    this.books.forEach(function(book) {
        author = book.author;
        if (authors.indexOf(author) == -1) {  // if author not in array
            authors.push(author);               //    add it
        }
    });
    return authors;
};

/*
  getRandomAuthorName - Retrieves a random author name from the library

  Returns:
    null - if library is empty
    string - author name
*/
library.prototype.getRandomAuthorName = function () {
    var book = this.getRandomBook();  // random book from library
    if (book == null) {
        return null;
    }
    return book.author;
};

/*
  saveLibraryToLocalStorage - saves all the books in the library to local localStorage
    returns:
      true -  if library was saved in local storage
      false - if the library was not saved in local storage
*/
library.prototype.saveLibraryToLocalStorage = function () {

    try {
        localStorage.setItem("library", JSON.stringify(this.books));
        return true;
    } catch (exception) {
        return false;
    }
};

/*
  getLibraryFromLocalStorage - retrieves the books in local storage and inserts them into the library
    returns:
      true -  if books was successfully retrived from local storage
      false - if books was not successfully retrived from local storage
*/
library.prototype.getLibraryFromLocalStorage = function () {

    var _this = this;
    var jsonLibrary;
    try {
        jsonLibrary = JSON.parse(localStorage.getItem("library"));
        jsonLibrary.forEach( function (jsonBook) {
            _this.addBook(new Book(jsonBook));
        });
        return true;  // able to get library from local storage 
    } catch (exception) {
        return false;   // local storage is full or inaccessable or error parsing json object
    }
};

/*
  search - searches the library given the criteria in searchObject
    returns:
      array of books - empty if nothing is found
*/
library.prototype.search = function (searchObject) {

    var i,j,k;
    var searchText;
    var keys;
    var values;
    var results = [];
    var result = [];
    for (i = 0; i < searchObject.length; ++i) {
        searchText = JSON.parse(searchObject[i]);
        keys = Object.keys(searchText);
        values = Object.values(searchText);
        for (j = 0; j < keys.length; ++j) {
            var key = keys[j];
            if (key == "title") {
                result = this.getBookByTitle(values[j]);
                if (result !== null) {
                    for (k = 0; k < result.length; ++k) {
                        results.push(result[k]);
                    }
                }
            } else if (key == "author") {
                result = this.getBooksByAuthor(values[j]);
                if (result !== null) {
                    for (k = 0; k < result.length; ++k) {
                        results.push(result[k]);
                    }
                }
            }
        }
    }
    return results;
};

// Book object
var Book = function (args) {
    this.title = args.title.trim();
    this.author = args.author.trim();
    this.numPages = args.numPages;
    this.pubDate = new Date(args.pubDate);
};
