/*
  library - is a singlton object.  It will create only one instance of itself
    returns:
      instance of library object
*/
var library = (function() {
  // Instance stores a reference to the Singleton
  var instance;

  function init() {
    // Singleton
    // Private methods and variables
    var books = [];

    return {
      // public methods and variables 
      /*
        addBook -  adds a book to the Library
          returns:
            false - if duplicate title is found and nothing added
            true - if book was not in library and has been added
      */
      addBook: function (book) {
        if (book == null) {
          // console.log("book is null");
          return false;
        } else if (books.length !== 0) {
          if (books.every(isTitleUnique)) {
            // console.log("book to add:", book);
            books.push(book);
            return true;
          } else {
            // console.log("duplicate title found");
            return false;
          }
        } else {
          // console.log("book being added:",book);
          books.push(book);
          return true;
        }

        function isTitleUnique(bookToAdd, index, array) {
          // console.log("isTitleUnique-title of book to add:", bookToAdd.title);
          return bookToAdd.title.toLowerCase() !== book.title.toLowerCase();
        }
      },

      /*
        removeBookByTitle -  Remove a book if title exactly matches book title
          returns:
            false - if a book was not removed
            true - if a book was removed
      */
      removeBookByTitle : function (title) {
        var _this = this;
        var notDeletedBooks = [];
        var hasDeletedBook = false;
        if (title !== null) { // title not a valid input
          books.forEach( function(book) { // walk through the library
            if (book.title == title) {
              // console.log("book to be deleted:", book);
              hasDeletedBook = true;
            } else {
              notDeletedBooks.push(book);
            }
          });
          this.books = notDeletedBooks;
        }
        return hasDeletedBook;
      },

      /*
        removeBooksByAuthor - Remove all books if authorName exacly matches Book's author from the library
          returns
            true - if book(s) were removed
            false - if no books matched
      */
      removeBooksByAuthor : function (authorName) {
        var hasDeletes = false;     // true if any books had to be deleted
        var notDeletedBooks= [];    // new array with all undeleted books
        if (authorName !== null) {
          books.forEach( function(book) { // walk through all the books in the library
            if (authorName !== book.author) { // look for an exact match
              notDeletedBooks.push(book);
            } else {
              // console.log("book to be deleted:", book);
              hasDeletes = true;
            }
          });
        } else {
          return false;
        }
        this.books = notDeletedBooks;
        return hasDeletes;
      },

      /*
        getRandomBook - returns a random book from the library
          returns:
            null - if no books in library
            Book object - if library has books
      */
      getRandomBook : function () {
        var i; // random index into array of books
        if ((typeof Array != 'undefined') && (books.length != 0)) {
           i = Math.floor(Math.random() * books.length);
           return this.books[i];
        } else {
          return null;
        }
      },

      /*
        getBookByTitle - Returns all books that completely or partially matches the string title passed into the function

        returns:
          array of Book object(s) if the title either totally or partially matches book title(s)
          null array if no books are found
      */
      getBookByTitle : function (title) {
        foundBooks = [];
        if (title !== null) {
          var regex = new RegExp(title, 'i');
          books.forEach( function (book) {
            if (regex.test(book.title)) {
              this.foundBooks.push(book);
            }
          });
        }
        return foundBooks;
      },

      /*
        get BooksByAuthor - Finds all books where the author’s name partially or completely matches the authorName argument
          returns:
            array of Book objects, can be empty if no book is found matching the search parameters
      */
      getBooksByAuthor : function (authorName) {
        foundBooks = [];
        if (authorName !== null) {
          var regex = new RegExp(authorName, 'i');
          books.forEach(function(book) {
            if (regex.test(book.author)) {    // returns true if authorName is found anywhere in string, ignores case
              this.foundBooks.push(book);
            }
          });
        }
        return foundBooks;
      },

      /*
        addBooks -  adds an array of Book objects to the library
          returns:
            number of books added to library
      */
      addBooks : function (books) {
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
      },

      /*
        getAuthors - Find the distinct authors’ names from all books in your library
          returns:
            empty array - if nothing is found.
            array of strings - each string an unique author's name
      */
      getAuthors : function () {
        var authors = [];  // Array of authors in library
        var author;                   // name of current author
        var index;                    // index of author in authors array
        books.forEach(function(book) {
          author = book.author;
          if (authors.indexOf(author) == -1) {  // if author not in array
            authors.push(author);               //    add it
            // console.log("author:", author);
          }
        });
        return authors;
      },

      /*
        getRandomAuthorName - Retrieves a random author name from the library
          returns:
            null - if library is empty
            string - author name
      */
      getRandomAuthorName : function () {
        var book = this.getRandomBook();  // random book from library
        if (book == null) {
          return null;
        }
        return book.author;
      },

      /*
        displayLibrary() - display all books in library
      */
      displayLibrary : function () {
        books.forEach(function(book) {
          console.log(book);
        });
      },

      /*
        saveLibraryToLocalStorage - saves all the books in the library to local localStorage
          returns:
            true -  if library was saved in local storage
            false - if the library was not saved in local storage
      */
      saveLibraryToLocalStorage : function () {
        try {
          localStorage.setItem("books", JSON.stringify(this.books));
          return true;
        } catch (exception) {
          return false;
        }
      },

      /*
        getLibraryFromLocalStorage - retrieves the books in local storage and inserts them into the Library
          returns:
            true -  if books was successfully retrived from local storage
            false - if books was not successfully retrived from local storage
      */
      getLibraryFromLocalStorage : function () {
        try {
          this.books = JSON.parse(localStorage.getItem("books"), function(key, value) {
            if (key == "pubDate") return new Date(value);
            return value;
          });
          return true;
        } catch (exception) {
          return false;
        }
      },

      /*
        search - searches the library given the criteria in searchObject
          returns:
            array of books - empty if nothing is found
      */
      search : function (searchObject) {
        var i,j,k;
        var searchText;
        var keys;
        var values;
        var results = [];
        var result = [];
        for (i = 0; i < searchObject.length; ++i) {
          // console.log("searchObject[",i,"]:", searchObject[i]);
          searchText = JSON.parse(searchObject[i]);
          keys = Object.keys(searchText);
          values = Object.values(searchText);
          for (j = 0; j < keys.length; ++j) {
            var key = keys[j];
            if (key == "title") {
              // console.log("values[",k,"]:", values[j]);
              result = this.getBookByTitle(values[j]);
              // console.log("1-result:", result);
              if (result !== null) {
                for (k = 0; k < result.length; ++k) {
                  results.push(result[k]);
                }
                // console.log("1-results:", results);
              }
            } else if (key == "author") {
              // console.log("values[",k,"]:", values[j]);
              result = this.getBooksByAuthor(values[j]);
              // console.log("2-result:", result);
              if (result !== null) {
                for (k = 0; k < result.length; ++k) {
                  results.push(result[k]);
                }
                // console.log("2-results:", results);
              }
            }
          }
        }
        // console.log("results:", results);
        return results;
      }
    };
  }
  return {
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function() {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };
})();

// Book object
var Book = function (args) {
  this.title = args.title.trim();
  this.author = args.author.trim();
  this.numPages = args.numPages;
  this.pubDate = new Date(args.pubDate);
};

var gIt = new Book({title: "It", author: "Stephen King", numPages: 1116, pubDate: "September 12, 1986"});
var gCatcherInTheRye = new Book({title: "Catcher in the Rye", author: "JD Salinger", numPages: 277, pubDate: "July 16, 1951"});
var gStarshipTroopers = new Book({title: "Starship Troopers", author: "Robert Heinlein", numPages: 263, pubDate: "November 2, 1959"});
var gStrangerInAStrangeLand = new Book({title: "Stranger in a Strange Land", author: "Robert Heinlein", numPages: 516, pubDate: "June 1, 1961"});
var gTheStand = new Book({title: "The Stand", author: "Stephen King",  numPages: 1153, pubDate: "April 14, 1978"});
var g1984 = new Book({title: "1984", author: "George Orwell", numPages: 328, pubDate: "June 8, 1949"});

var arrayOfBooks = [
  new Book({title: "The Naked and the Dead", author: "Norman Mailer", numPages: 721, pubDate: "July 10, 1948"}),
  new Book({title: "The Puppet Masters", author: "Robert Heinlein", numPages: 307, pubDate: "March 10, 1951"}),
  new Book({title: "Pride and Prejudice", author: "Jane Austin", numPages: 249, pubDate: "January 28, 1813"}),
  new Book({title: "Carrie", author: "Stephen King", numPages: 253, pubDate: "April 5, 1974"})
];

var allBooks = [
  new Book({title: "It", author: "Stephen King", numPages: 1116, pubDate: "September 12, 1986"}),
  new Book({title: "Catcher in the Rye", author: "JD Salinger", numPages: 277, pubDate: "July 16, 1951"}),
  new Book({title: "Starship Troopers", author: "Robert Heinlein", numPages: 263, pubDate: "November 2, 1959"}),
  new Book({title: "Stranger in a Strange Land", author: "Robert Heinlein", numPages: 516, pubDate: "June 1, 1961"}),
  new Book({title: "The Stand", author: "Stephen King",  numPages: 1153, pubDate: "April 14, 1978"}),
  new Book({title: "1984", author: "George Orwell", numPages: 328, pubDate: "June 8, 1949"}),
  new Book({title: "The Naked and the Dead", author: "Norman Mailer", numPages: 721, pubDate: "July 10, 1948"}),
  new Book({title: "The Puppet Masters", author: "Robert Heinlein", numPages: 307, pubDate: "March 10, 1951"}),
  new Book({title: "Pride and Prejudice", author: "Jane Austin", numPages: 249, pubDate: "January 28, 1813"}),
  new Book({title: "Carrie", author: "Stephen King", numPages: 253, pubDate: "April 5, 1974"})
];

var searchObject = ['{"author": "ein", "title": "and"}'];

// window.singleton = new Singleton();
window.lib1 = library.getInstance();
window.lib2 = library.getInstance();
