class Library {

    constructor(libraryName) {
        this.libraryName = libraryName;
        this.books = [];
    }
    /*
      addBook -  adds a book to the Library
        returns:
          false - if duplicate title is found and nothing added
          true - if book was not in library and has been added
    */
    addBook(book) {
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
    }

    /*
      removeBookByTitle -  Remove a book if title exactly matches book title
        returns:
          false - if a book was not removed
          true - if a book was removed
    */
    removeBookByTitle(title) {
        let notDeletedBooks = [];
        let hasDeletedBook = false;
        if (title !== null) { // title not a valid input
            this.books.forEach(function (book) { // walk through the library
                if (book.title == title) {
                    hasDeletedBook = true;
                } else {
                    notDeletedBooks.push(book);
                }
            });
            this.books = notDeletedBooks;
        }
        return hasDeletedBook;
    }

    /*
      removeBooksByAuthor - Remove all books if authorName exacly matches Book's author from the library
        returns
          true - if book(s) were removed
          false - if no books matched
    */
    removeBooksByAuthor(authorName) {

        let hasDeletes = false; // true if any books had to be deleted
        let notDeletedBooks = []; // new array with all undeleted books
        if (authorName !== null) {
            this.books.forEach(function (book) { // walk through all the books in the library
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
    }

    /*
      getRandomBook - returns a random book from the library
        returns:
          null - if no books in library
          Book object - if library has books
    */
    getRandomBook() {

        let i; // random index into array of books
        if ((typeof Array != "undefined") && (this.books.length != 0)) {
            i = Math.floor(Math.random() * this.books.length);
            return this.books[i];
        } else {
            return null;
        }
    }

    /*
      getBookByTitle - Returns all books that completely or partially matches the string title passed into the function

      returns:
        array of Book object(s) if the title either totally or partially matches book title(s)
        null array if no books are found
    */
    getBookByTitle(title) {
        let foundBooks = [];
        if (title !== null) {
            let regex = new RegExp(title, "i");
            this.books.forEach(function (book) {
                if (regex.test(book.title)) {
                    foundBooks.push(book);
                }
            });
        }
        return foundBooks;
    }

    /*
      get BooksByAuthor - Finds all books where the author’s name partially or completely matches the authorName argument
        returns:
          array of Book objects, can be empty if no book is found matching the search parameters
    */
    getBooksByAuthor(authorName) {

        let foundBooks = [];
        if (authorName !== null) {
            let regex = new RegExp(authorName, "i");
            this.books.forEach(function (book) {
                if (regex.test(book.author)) { // returns true if authorName is found anywhere in string, ignores case
                    foundBooks.push(book);
                }
            });
        }
        return foundBooks;
    }

    /*
      addBooks -  adds an array of Book objects to the library
        returns:
          number of books added to library

    */
    addBooks(books) {

        let _this = this;
        let isBookAdded = false;
        let addedCounter = 0;
        books.forEach(function (book) {
            isBookAdded = _this.addBook(book);
            if (isBookAdded) {
                ++addedCounter;
            }
        });
        return addedCounter;
    }

    /*
      getAuthors - Find the distinct authors’ names from all books in your library
        returns:
          empty array - if nothing is found.
          array of strings - each string an unique author's name
    */
    getAuthors() {
        let authors = []; // Array of authors in library
        let author; // name of current author
        this.books.forEach(function (book) {
            author = book.author;
            if (authors.indexOf(author) == -1) { // if author not in array
                authors.push(author); //    add it
            }
        });
        return authors;
    }

    /*
      getRandomAuthorName - Retrieves a random author name from the library

      Returns:
        null - if library is empty
        string - author name
    */
    getRandomAuthorName() {
        let book = this.getRandomBook(); // random book from library
        if (book == null) {
            return null;
        }
        return book.author;
    }
}

// Book object
class Book {

    constructor(args) {
        this._id = args._id;
        this.title = args.title;
        this.author = args.author;
        this.numPages = args.numPages;
        this.pubDate = new Date(args.pubDate);
        this.cover = args.cover;
        this.__v = args.__v;
    }
}

class Page extends Library {
    constructor(libraryName) {
        super(libraryName);
        this.booksToAdd = [];   // array of books to add to library
        this.editTableRow;      // The table row being edited.
        this.originalTitle;     // Save the book's original title before editing
    }

    // get library from local storage and bind events.
    // homeTable and addTable are here to make sure lib is populated first.
    init() {
        this.getLibraryFromDB();
        this._bindEvents();

        // This datatable is displayed on the home page
        this.homeTable = $("#displayTable").DataTable({
            data: this.books,
            columns: [
                { data: "_id" },
                { data: "author" },
                { data: "title" },
                { data: "numPages" },
                { data: "pubDate",
                    render: function (data) {
                        return data.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        });
                    }
                },
                { data: "cover" },
                { data: "__v" },
                {   orderable: false,
                    data: "icons",
                    render: function () {
                        return ("<i class=\"material-icons editRow mx-2\">create</i> " + "<i class=\"material-icons deleteRow\">delete</i>");
                    }
                }
            ]
        });

        // The add datatable is used when adding boooks it's inside the modal addModal
        this.addTable = $("#addModalTable").DataTable({

        });
    }

    _bindEvents() {
        $("#addModal").on("show.bs.modal", $.proxy(this.modalAdd, this));
        $("#btnAddABook").on("click", $.proxy(this.btnAddBookToList, this));
        $("#btnSaveBooks").on("click", $.proxy(this.btnSaveBooksToLibrary, this));
        $("#btnAddABook").on("click", $.proxy(this.btnAddBook, this));
        $("#btnSaveEdit").on("click", $.proxy(this.btnSaveEdit, this));
        $("#showAllAuthorsModal").on("click", ".allAuthorsList", $.proxy(this.btnAuthorToDelete, this));
        $("#displayTable").on("click", ".deleteRow", "i", $.proxy(this.iconDeleteRow, this));
        $("#displayTable").on("click", ".editRow", "i", $.proxy(this.iconEditAuthorAndTitle, this));
        $("#showAllAuthorsModal").on("show.bs.modal", $.proxy(this.modalShowAllAuthors, this));
        $("#recommendModal").on("show.bs.modal", $.proxy(this.modalRecommend, this));
    }

    // Show the modal to add books.
    modalAdd() {

    }

    /*
        btnAddBookToList - takes the values from the input elements in the addModal modal and saves them to the booksToAdd array.
            if the title is not found in the main table it adds the book to the addModal table to display.
    */
    btnAddBookToList() {
        // save the values that were inputted
        let author = $(".inpAuthor").val();
        let title = $(".inpTitle").val();
        let numPages = $(".inpNumPages").val();
        let pubDate = $(".inpPubDate").val();
        this.booksToAdd.push(new Book({
            _id : 0,
            author: author,
            title: title,
            numPages: numPages,
            pubDate: pubDate,
            cover: "No cover",
            __v: 0
        }));
        // clear the input tags to show the placeholder value
        $(".inpAuthor").val("");
        $(".inpTitle").val("");
        $(".inpNumPages").val("");
        $(".inpPubDate").val("");
        if (this.findTitleInTable(title)) { // pop an alert but don't add the book to the table
            alert("Duplicate title: " + title + " found in table");
        } else {    // add the book to the modal table
            this.addTable.row.add([author, title, numPages, pubDate]);
            this.addTable.draw(false);
        }
    }

    /*
        findTitleInTable - looks for duplicate titles in the table
            returns:
                true - if duplicate is found
                false - title is not in table
    */
    findTitleInTable(title) {
        let index = this.homeTable.columns(2).data().eq( 0 ).indexOf( title );
        if (index === -1 ) {
            return true;
        } else {
            return false;
        }
    }

    // Save all books in booksToAdd array to the library
    btnSaveBooksToLibrary() {
        if (Array.isArray(this.booksToAdd) && this.booksToAdd.length) { // make sure there are books to add
            let _this = this;
            // this.addBooks(this.booksToAdd); //add the new books to the library
            // this.saveLibraryToLocalStorage();
            this.booksToAdd.forEach(function (book) {     // add books to table
                _this.addBookToLibrary(book);
                _this.homeTable.row.add(book);
            });
            // clear the table and the input fields in the add modal
            this.addTable.clear();
            $(".inpAuthor").val("");
            $(".inpTitle").val("");
            $(".inpNumPages").val("");
            $(".inpPubDate").val("");
            this.homeTable.draw(false);  //  Show the new books
            $("#addModal").modal("hide");
        }
    }

    // This modal will show all unique authors in the library and allow users to delete all books by an
    // author by clicking on their name
    modalShowAllAuthors() {
        $("#allAuthorsList").empty(); // clear out any old html
        let insertString = "";
        let authors = this.getAllAuthors();
        authors.forEach(function (author) {
            insertString = insertString + "<li class=\"allAuthorsList\">" + author + "</li>";
        });
        $("#allAuthorsList").append(insertString);
    }

    getAllAuthors() {
        let authors = [];
        let data = this.homeTable.rows().data();
        data.each(function (book) {
            if (authors.indexOf(book.author) == -1) {    // if author not in array
                authors.push(book.author);               //    add it
            }
        });
        return authors;
    }

    // Get a random book to recommend
    modalRecommend() {
        // let book = this.getRandomBookFromTable();
        let rowCount = this.homeTable.rows().count();
        let randomCount = Math.floor(Math.random() * (rowCount + 1));
        let book = new Book(this.homeTable.row(randomCount).data());
        $("#imgRecommendImage").attr("src", "images/" + book.title + ".jpg");
        $("#pRecommendTitle").text(book.title);
        $("#pRecommendAuthor").text(book.author);
        $("#pRecommendNumPages").text(book.numPages);
        $("#pRecommendPubDate").text(book.pubDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }));
    }

    // After finishing editing the book title and/or author save the book to the library and 
    // then save the library to local storage
    btnSaveEdit() {
        let author = $("#editModalAuthor").val();
        let title = $("#editModalTitle").val();
        let books = this.getBookByTitle(this.originalTitle); // getBookByTitle returns an array
        let book = books[0];    // should have only one book in the array
        book.author = author;
        book.title = title;
        this.removeBookByTitle(this.originalTitle);
        this.addBook(book);
        this.saveLibraryToLocalStorage();
        this.editTableRow.children("td:nth-child(1)").text(author); // update the table
        this.editTableRow.children("td:nth-child(2)").text(title);
        this.homeTable.draw(false);
        $("#editModal").modal("hide");
    }

    btnAuthorToDelete(e) {
        let author = $(e.currentTarget).text();
        if (confirm("Are you sure you want to delete all the books by " + author + " ?")) {
            this.removeBooksByAuthor(author);
            this.saveLibraryToLocalStorage();
        }
        location.reload();  //  Refresh the table
    }

    // edit Author and/or Title in the selected row
    iconEditAuthorAndTitle(e) {
        this.editTableRow = $(e.currentTarget).closest("tr");
        let author = this.editTableRow.children("td:nth-child(1)").text();
        this.originalTitle = this.editTableRow.children("td:nth-child(2)").text();
        $("#editModalAuthor").val(author);
        $("#editModalTitle").val(this.originalTitle);
        $("#editModal").modal("show"); // pop the edit modal
    }

    // delete the selected row from the table and the corresponding book from the library
    iconDeleteRow(e) {
        let tableRow = $(e.currentTarget).closest("tr");
        let book = $("#displayTable").dataTable().fnGetData( tableRow );   // get the data for the row
        if (confirm("Are you sure you want to delete \"" + book.title + "\" ?")) {
            this.removeBookById(book._id);
            this.homeTable.row(tableRow).remove();
            this.homeTable.draw(false);
        }
    }

    getBookById(id) {
        $.ajax ({
            dataType: "json",
            type: "GET",
            url: "http://localhost:3000/library/" + id
        }).done( function(response) {
            console.log(response);
        }).fail( function(response) {
            console.log(response);
        });
    }

    /*
        removeBookById - removes a book from the database
    */
    removeBookById(id) {
        $.ajax ({
            url: "http://localhost:3000/library/" + id,
            dataType: "json",
            type: "DELETE",
        }).done( function(response) {
            console.log(response);
        }).fail( function(response) {
            console.log(response);
        });
    }

    /*
        getLibraryFromDB - will get the entire library from the database
    */
    getLibraryFromDB() {
        $.ajax ({
            dataType: "json",
            type: "GET",
            url: "http://localhost:3000/library/"
        }).done($.proxy(this.addResponseToTable, this)
        ).fail($.proxy(this.failedResponse, this));
    }

    /*
        addResponseToTable - adds the response data to the table and hides the _id, cover and __v columns
    */
    addResponseToTable(response) {
        let _self = this;
        if (response instanceof Array) {
            response.forEach( function (object) {
                _self.addBookToTable(new Book(object));
            });
        } else {
            this.addBookToTable(new Book(response));
        }
    }

    /*
        addBookToTable - adds a book to the table and hides the _id, cover and __v columns 
    */
    addBookToTable(book) {
        this.homeTable.row.add(book);
        this.homeTable.columns( [ 0, 5, 6 ] ).visible( false );
        this.homeTable.row().draw(false);
    }

    failedResponse(response) {
        console.log(response);
    }

    /*

    */
    addBookToLibrary(book) {
        $.ajax ({
            dataType: "json",
            type: "POST",
            data: book,
            url: "http://localhost:3000/library/",
        }).done($.proxy(this.addResponseToTable, this)
        ).fail($.proxy(this.failedResponse, this));
    }
}

$(function () {
    window.page = new Page("library");
    window.page.init();
});