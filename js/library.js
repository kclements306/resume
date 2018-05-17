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
        // this.books = [];
    }

    // get library from local storage and bind events.
    // homeTable and addTable are here to make sure lib is populated first.
    init() {
        this.getLibraryFromDB();
        this._bindEvents();
        // This datatable is displayed on the home page
        this.homeTable = $("#displayTable").DataTable({
            // data: this.books,
            ajax: {
                dataType: "json",
                type: "GET",
                url: "http://localhost:3000/library/"
            },
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

        // The add datatable is used when adding boooks it's inside the modal addModal
        this.addTable = $("#addModalTable").DataTable({
            paging: false,
            searching: false
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
        let cover = $(".textCover").val();
        this.booksToAdd.push(new Book({
            _id : 0,
            author: author,
            title: title,
            numPages: numPages,
            pubDate: pubDate,
            cover: cover,
            __v: 0
        }));
        // clear the input tags to show the placeholder value
        $(".inpAuthor").val("");
        $(".inpTitle").val("");
        $(".inpNumPages").val("");
        $(".inpPubDate").val("");
        $(".textCover").val("");
        if (this.findTitleInTable(title)) { // pop an alert but don't add the book to the table
            alert("Duplicate title: " + title + " found in table");
        } else {    // add the book to the modal table
            this.addTable.row.add([0, author, title, numPages, pubDate, cover.substring[0, 24], 0]);
            this.addTable.draw(false);
        }
    }

    /*
        findTitleInTable - looks for the title in the table
            returns:
                true - if duplicate is found
                false - title is not in table
    */
    findTitleInTable(title) {
        let index = this.homeTable.columns(2).data().eq( 0 ).indexOf( title );
        if (index === -1 ) {
            return false;
        } else {
            return true;
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
            });
            // clear the table and the input fields in the add modal
            this.addTable.clear().draw();
            $(".inpAuthor").val("");
            $(".inpTitle").val("");
            $(".inpNumPages").val("");
            $(".inpPubDate").val("");
            this.homeTable.draw(false);  //  Show the new books
            $("#addModal").modal("hide");
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
            returns: a book
    */
    modalRecommend() {
        let rowCount = this.homeTable.rows().count();
        let randomCount = Math.floor(Math.random() * rowCount);
        let book = new Book(this.homeTable.row(randomCount).data());
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

    // After finishing editing the book title and/or author save the book to the library and 
    // then save the library to local storage
    btnSaveEdit() {
        this.bookToEdit.author = $("#editModalAuthor").val();
        this.bookToEdit.title = $("#editModalTitle").val();
        this.updateBookInLibrary(this.bookToEdit);
    }

    btnAuthorToDelete(e) {
        let author = $(e.currentTarget).text();
        if (confirm("Are you sure you want to delete all the books by " + author + " ?")) {
            this.removeBooksByAuthor(author);
        }
        this.homeTable.draw();  //  Refresh the table
    }

    removeBooksByAuthor(author) {
        let rows = this.homeTable.column(1).search(author);
        console.log(rows);
    }

    // edit Author and/or Title in the selected row
    iconEditAuthorAndTitle(e) {
        this.editTableRow = $(e.currentTarget).closest("tr");
        let index = this.homeTable.row( this.editTableRow ).index();    // Get index of row to edit
        this.bookToEdit = new Book(this.homeTable.row( index ).data()); // get book to edit
        $("#editModalAuthor").val(this.bookToEdit.author);
        $("#editModalTitle").val(this.bookToEdit.title);
        $("#editModal").modal("show"); // pop the edit modal
    }

    /*
        updateBookInTable - update the author and title of the book in the table
    */
    updateBookInTable(book) {
        this.editTableRow.children("td:nth-child(1)").text(book.author); // update the table
        this.editTableRow.children("td:nth-child(2)").text(book.title);
        this.homeTable.draw(false);
        $("#editModal").modal("hide");
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
        let _this = this;
        $.ajax ({
            dataType: "json",
            type: "GET",
            url: "http://localhost:3000/library/" + id
        }).done( function(response) {
            console.log(response);
        }).fail( function(response) {
            _this.failedResponse(response);
        });
    }

    /*
        removeBookById - removes a book from the database
    */
    removeBookById(id) {
        let _this = this;
        $.ajax ({
            url: "http://localhost:3000/library/" + id,
            dataType: "json",
            type: "DELETE",
        }).done( function(response) {
            console.log(response);
        }).fail( function(response) {
            _this.failedResponse(response);
        });
    }

    /*
        getLibraryFromDB - will get the entire library from the database
    */
    getLibraryFromDB() {
        let _this = this;
        $.ajax ({
            dataType: "json",
            type: "GET",
            url: "http://localhost:3000/library/"
        }).done( function (response) {
            response.forEach( function (object) {
                _this.addBookToTable(new Book(object));
            });
        }).fail( function (response) {
            _this.failedResponse(response);
        });
    }

    /*
        addBookToTable - adds a book to the table and hides the _id, cover and __v columns 
    */
    addBookToTable(book) {
        this.homeTable.row.add(book);
        // this.homeTable.columns( [ 0, 5, 6 ] ).visible( false );
        this.homeTable.row().draw(false);
    }

    failedResponse(response) {
        console.log(response);
    }

    /*
        updateBookInLibrary - updates a book in the library
    */
    updateBookInLibrary(book) {
        let _this = this;
        $.ajax ({
            dataType: "json",
            type: "PUT",
            data: book,
            url: "http://localhost:3000/library/" + book._id,
        }).done( function (response) {
            _this.updateBookInTable(new Book(response));       // The response will have the _id field
        }).fail( function (response) {
            _this.failedResponse(response);
        });
    }

    /*

    */
    addBookToLibrary(book) {
        let _this = this;
        $.ajax ({
            dataType: "json",
            type: "POST",
            data: book,
            url: "http://localhost:3000/library/",
        }).done( function (response) {
            _this.addBookToTable(new Book(response));       // The response will have the _id field
        }).fail( function (response) {
            _this.failedResponse(response);
        });
    }
}

$(function () {
    window.library = new Library();
    window.library.init();
});