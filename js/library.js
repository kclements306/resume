
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

class Library {
    constructor() {
        this.booksToAdd = [];   // array of books to add to library
        this.editTableRow;      // The table row being edited.
        this.originalTitle;     // Save the book's original title before editing
        this.bookToEdit;       // book being edited
        this.books = [];
    }

    /*
        init - get library and bind events.  homeTable and addTable are here to make sure lib is populated first.
    */
    init() {
        this.getAllBooksFromLibrary();
        this._bindEvents();
        // This datatable is displayed on the home page
        this.homeTable = $("#displayTable").DataTable({
            data: this.books,
            pageLength: 25,
            // ajax: {
            //     dataType: "json",
            //     type: "GET",
            //     url: "http://localhost:3000/library/"
            // },
            columns: [
                { data: "_id", defaultContent: "", visible: false },
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
                { data: "cover", defaultContent: "", visible: false },
                { data: "__v", defaultContent: "", visible: false },
                {   orderable: false,
                    data: "icons",
                    render: function () {
                        return ("<i class=\"material-icons editRow mx-2\">create</i> " + "<i class=\"material-icons deleteRow\">delete</i>");
                    }
                }
            ]
        });

        // The add datatable is used when adding books 
        this.addTable = $("#addModalTable").DataTable({
            paging: false,
            searching: false,
        });
    }

    _bindEvents() {
        $("#addModal").on("show.bs.modal", $.proxy(this.modalAdd, this));
        $("#btnAddABook").on("click", $.proxy(this.btnAddBookToList, this));
        $("#btnSaveBooks").on("click", $.proxy(this.btnSaveBooksToLibrary, this));
        $("#btnAddABook").on("click", $.proxy(this.btnAddBook, this));
        $("#btnSaveEdit").on("click", $.proxy(this.btnSaveEdit, this));
        $("#showAllAuthorsModal").on("click", ".allAuthorsList", $.proxy(this.removeBooksByAuthor, this));
        $("#displayTable").on("click", ".deleteRow", "i", $.proxy(this.iconDeleteRow, this));
        $("#displayTable").on("click", ".editRow", "i", $.proxy(this.iconEditAuthorAndTitle, this));
        $("#showAllAuthorsModal").on("show.bs.modal", $.proxy(this.modalShowAllAuthors, this));
        $("#recommendModal").on("show.bs.modal", $.proxy(this.modalRecommend, this));
    }

    // Show the modal to add books.
    modalAdd() {
        this.booksToAdd = [];    // make sure to start with no books
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
        let cover = $(".textCover").val();
        // clear the input tags to show the placeholder value
        $(".inpAuthor").val("");
        $(".inpTitle").val("");
        $(".inpNumPages").val("");
        $(".inpPubDate").val("");
        $(".textCover").val("");
        // pop an alert if a duplicate title is found but don't add the book to the table
        if ((this.homeTable.columns(2).data().eq(0).indexOf(title) == -1) ? false : true) { 
            alert("Duplicate title: " + title + " found in table");
        } else if ((this.addTable.columns(1).data().eq(0).indexOf(title) == -1) ? false : true) { 
            alert("Duplicate titles: " + title + " are not allowed");
        } else {
            // add the book to the add modal table and the booksToAdd array
            this.addTable.row.add([author, title, numPages, pubDate, cover.substring(0, 24)]);
            this.addTable.draw(false);
            this.booksToAdd.push(new Book({
                _id: 0,
                author: author,
                title: title,
                numPages: numPages,
                pubDate: pubDate,
                cover: cover,
                __v: 0
            }));
        }
    }

    /*
        btnSaveBooksToLibrary - Save all the books in booksToAdd array to the library
    */
    btnSaveBooksToLibrary() {
        let _this = this;
        if (Array.isArray(this.booksToAdd) && this.booksToAdd.length) { // make sure there are books to add
            // clear the table and the input fields in the add modal
            this.addTable.clear().draw();
            $(".inpAuthor").val("");
            $(".inpTitle").val("");
            $(".inpNumPages").val("");
            $(".inpPubDate").val("");
            $("#addModal").modal("hide");
            this.booksToAdd.forEach(function (book) {     // add books to library
                _this.addBookToLibrary(book, addBookToTable);
            });
        } else {
            console.log(this.booksToAdd);
        }
        function addBookToTable(book) {
            _this.homeTable.row.add(book);
            _this.homeTable.row().draw(false);
        }

    }

    /*
        modalShowAllAuthors - This modal will show all unique authors in the library and allow users to delete all books by an
            author by clicking on their name
    */
    modalShowAllAuthors() {
        $("#allAuthorsList").empty(); // clear out any old html
        let insertString = "";
        this.homeTable.columns( 1 ).data().eq( 0 ).sort().unique()  // Get each author in the Author column
            .each( function (author) {
                insertString = insertString + "<li class=\"allAuthorsList\">" + author + "</li>";
            });      
        $("#allAuthorsList").append(insertString);
    }

    /*
        modalRecommend - Get a random book to recommend
    */
    modalRecommend() {
        let rowCount = this.homeTable.rows().count();
        let randomCount = Math.floor(Math.random() * rowCount);
        let book = new Book(this.homeTable.row(randomCount).data());
        this.getBookByIdFromLibrary(book._id, populateModalRecommend);
        function populateModalRecommend(book) {
            $("#imgRecommendImage").attr("src", book.cover);
            $("#pRecommendTitle").text(book.title);
            $("#pRecommendAuthor").text(book.author);
            $("#pRecommendNumPages").text(book.numPages);
            $("#pRecommendPubDate").text(book.pubDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }));
        }
    }

    /*
        btnSaveEdit - After finishing editing the book title and/or author save the book to the library
    */
    btnSaveEdit() {
        let _this = this;
        this.bookToEdit.author = $("#editModalAuthor").val();
        this.bookToEdit.title = $("#editModalTitle").val();
        this.updateBookInLibrary(this.bookToEdit, updateBookInTable);

        function updateBookInTable(book) {
            // update the table
            _this.editTableRow.children("td:nth-child(1)").text(book.author); 
            _this.editTableRow.children("td:nth-child(2)").text(book.title);
            _this.homeTable.draw(false);
            $("#editModal").modal("hide");
        }
    }

    /*
        removeBooksByAuthor - Removes all books by an author from library and main table 
    */
   removeBooksByAuthor(e) {
        let _this = this;
        let author = $(e.currentTarget).text();
        if (confirm("Are you sure you want to delete all the books by " + author + " ?")) {
            $("#showAllAuthorsModal").modal("hide");
            let rows = this.homeTable.rows(function (idx, data) {
                return (data.author === author) ? true : false;
            }).data().each( function (row) {
                let book = new Book(row);
                _this.removeBookByIdFromLibrary(book._id, removeBookByIdFromTable);
            });
        }
        // remove book from the main table by book._id
        function removeBookByIdFromTable(_id) {
            _this.homeTable.rows( function ( idx, data, node ) {
                return ((data._id == _id) ? true : false);
            } ).remove().draw();
        }
    }

    /*
        iconEditAuthorAndTitle - edit Author and/or Title in the selected row
    */
    iconEditAuthorAndTitle(e) {
        this.editTableRow = $(e.currentTarget).closest("tr");
        let index = this.homeTable.row( this.editTableRow ).index();    // Get index of row to edit
        this.bookToEdit = new Book(this.homeTable.row( index ).data()); // get book to edit
        $("#editModalAuthor").val(this.bookToEdit.author);
        $("#editModalTitle").val(this.bookToEdit.title);
        $("#editModal").modal("show"); // pop the edit modal
    }

    /*
        iconDeleteRow - delete the selected row from the table and the corresponding book from the library
    */
    iconDeleteRow(e) {
        let _this = this;
        let tableRow = $(e.currentTarget).closest("tr");
        let book = $("#displayTable").dataTable().fnGetData( tableRow );   // get the data for the row
        if (confirm("Are you sure you want to delete \"" + book.title + "\" ?")) {
            this.removeBookByIdFromLibrary(book._id, removeRow);
        }
        function removeRow() {
            _this.homeTable.row(tableRow).remove();
            _this.homeTable.draw(false);
        }
    }

    /*
        getBookById - get the book by Id from the library 
    */
    getBookByIdFromLibrary(id, callback) {
        let _this = this;
        $.ajax ({
            dataType: "json",
            type: "GET",
            url: "http://localhost:3000/library/" + id
        }).done( function(response) {
            callback(new Book(response));
        }).fail( function(response) {
            _this.failedResponse(response);
        });
    }

    /*
        removeBookByIdFromLibrary - removes a book by Id from the library
    */
    removeBookByIdFromLibrary(_id, callback) {
        let _this = this;
        $.ajax ({
            url: "http://localhost:3000/library/" + _id,
            dataType: "json",
            type: "DELETE",
        }).done( function(response) {
            // console.log("delete success response")
            callback(_id);
        }).fail( function(response) {
            // console.log("delete fail response")
            callback(_id);
            // _this.failedResponse(response);
        });
    }

    /*
        getAllBooksFromLibrary - will get all the books in the library
    */
    getAllBooksFromLibrary() {
        let _this = this;
        $.ajax ({
            dataType: "json",
            type: "GET",
            url: "http://localhost:3000/library/"
        }).done( function (response) {
            response.forEach( function (object) {
                let book = new Book(object);
                _this.homeTable.row.add(book);
                _this.homeTable.row().draw(false);
            });
        }).fail( function (response) {
            _this.failedResponse(response);
        });
    }

    /*
        updateBookInLibrary - updates a book in the library
    */
    updateBookInLibrary(book, callback) {
        let _this = this;
        $.ajax ({
            dataType: "json",
            type: "PUT",
            data: book,
            url: "http://localhost:3000/library/" + book._id,
        }).done( function (response) {
            callback(new Book(response));
        }).fail( function (response) {
            _this.failedResponse(response);
        });
    }

    /*
        addBookToLibrary - add the book to the library
            book - book to add
    */
    addBookToLibrary(book, callback) {
        let _this = this;
        $.ajax ({
            dataType: "json",
            type: "POST",
            data: book,
            url: "http://localhost:3000/library/",
        }).done( function (response) {
            // The response will have a new book oobject with _id
            callback(new Book(response));      
        }).fail( function (response) {
            _this.failedResponse(response);
        });
    }

    failedResponse(response) {
        console.log(response);
    }
}

$(function () {
    window.library = new Library();
    window.library.init();
});