var page = function () {

    this.lib = new library("library");
    this.booksToAdd = [];
};

// get library from local storage and bind events.
// homeTable and addTable are here to make sure lib is populated first.
page.prototype.init = function () {
    this.lib.getLibraryFromLocalStorage();
    this._bindEvents();

    // This datatable is displayed on the home page
    this.homeTable = $("#displayTable").DataTable({
        data: this.lib.books,
        columns: [
            { data: "author" },
            { data: "title" },
            { data: "numPages" },
            { data: "pubDate",
                render: function (data) {
                    return data.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                }
            },
            { orderable: false, data: "icons",
                render: function () {
                    return ("<i class=\"material-icons editRow mx-2\">create</i> " + "<i class=\"material-icons deleteRow\">delete</i>");
                }
            }
        ]
    });

    // The add datatable is used when adding boooks it's inside the modal addModal
    this.addTable = $("#addModalTable").DataTable({

    });
};

page.prototype._bindEvents = function () {
    $("#addModal").on("show.bs.modal", $.proxy(this.modalAdd, this));
    $("#btnAddABook").on("click", $.proxy(this.btnAddBookToList, this));
    $("#btnSaveBooks").on("click", $.proxy(this.btnSaveBooksToLibrary, this));
    $("#btnAddABook").on("click", $.proxy(this.btnAddBook, this));
    $("#btnSaveEdit").on("click", $.proxy(this.btnSaveEdit, this));
    $("#showAllAuthorsModal").on("click", $.proxy(this.btnAuthorToDelete, this));
    $("#displayTable").on("click", ".deleteRow", "i", $.proxy(this.iconDeleteRow, this));
    $("#displayTable").on("click", ".editRow", "i", $.proxy(this.iconEditAuthorAndTitle, this));
    $("#showAllAuthorsModal").on("show.bs.modal", $.proxy(this.modalShowAllAuthors, this));
    $("#recommendModal").on("show.bs.modal", $.proxy(this.modalRecommend, this));
};

// Show the modal to add books.
page.prototype.modalAdd = function () {

};

// This function takes the values from the input elements in the addModal modal and saves them to the booksToAdd array
// then it adds the book to the addModal table to display.
page.prototype.btnAddBookToList = function () {
    // save the values that were inputted
    var author = $(".inpAuthor").val();
    var title = $(".inpTitle").val();
    var numPages = $(".inpNumPages").val();
    var pubDate = $(".inpPubDate").val();
    this.booksToAdd.push(new Book( { author: author, title: title, numPages: numPages, pubDate: pubDate } ));
    // clear the input tags to show the placeholder value
    $(".inpAuthor").val("");
    $(".inpTitle").val("");
    $(".inpNumPages").val("");
    $(".inpPubDate").val("");
    // add the book to the modal table
    this.addTable.row.add([ author, title, numPages, pubDate ]);
    this.addTable.draw(false);
};

// Save all books in booksToAdd array to the library
page.prototype.btnSaveBooksToLibrary = function () {
    if (Array.isArray(this.booksToAdd) && this.booksToAdd.length) { // make sure there are books to add
        this.lib.addBooks(this.booksToAdd);   //add the new books to the library
        this.lib.saveLibraryToLocalStorage();
        // clear the table and the input fields in the add modal
        this.addTable.clear();
        $(".inpAuthor").val("");
        $(".inpTitle").val("");
        $(".inpNumPages").val("");
        $(".inpPubDate").val("");
        $("#addModal .close").click();
        location.reload();
    }
};

// This modal will show all unique authors in the library and allow users to delete all books by an
// author by clicking on their names
page.prototype.modalShowAllAuthors = function () {
    $("#authorsToDeleteHTML").remove(); // clear out any old buttons
    var insertString = "<div id=\"authorsToDeleteHTML\">";
    var authors = this.lib.getAuthors();
    authors.forEach(function (author) {
        insertString = insertString + "<button type=\"button\" class=\"btn btn-outline-secondary authorToDelete\">" + author + "</button>";
    });
    insertString = insertString + "</div>";
    $(insertString).insertAfter("#authorsMarker");
};

// Get a random book to recommend
page.prototype.modalRecommend = function () {
    var book = this.lib.getRandomBook();
    $("#imgRecommendImage").attr("src", "images/" + book.title + ".jpg");
    $("#pRecommendTitle").text(book.title);
    $("#pRecommendAuthor").text(book.author);
    $("#pRecommendNumPages").text(book.numPages);
    $("#pRecommendPubDate").text(book.pubDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    }));
};

// After finishing editing the book title and/or author save the book to the library and 
// then save the library to local storage
page.prototype.btnSaveEdit = function () {
    var author = $("#editModalAuthor").val();
    var title = $("#editModalTitle").val();
    var originalTitle = $("#editModalTitle").attr("name");
    var books = this.lib.getBookByTitle(originalTitle);
    var book = books[0];
    book.author = author;
    book.title = title;
    this.lib.removeBookByTitle(originalTitle);
    this.lib.addBook(book);
    this.lib.saveLibraryToLocalStorage();
    // this.homeTable.draw(false);
    // $("#editModal").modal("hide");
    location.reload();
};

page.prototype.btnDeleteByAuthor = function () {
    var author = $(this).text();
    if (confirm("Are you sure you want to delete all the books by " + author + " ?")) {
        this.lib.removeBooksByAuthor(author);
        this.lib.saveLibraryToLocalStorage();
    }
};

// edit Author and/or Title in the selected row
page.prototype.iconEditAuthorAndTitle = function (e) {
    var tableRow = $(e.currentTarget).parent().parent("tr");
    var author = tableRow.children("td:nth-child(1)").text();
    var originalTitle = tableRow.children("td:nth-child(2)").text();
    $("#editModalAuthor").text(author);
    $("#editModalTitle").text(originalTitle);
    $("#editModalTitle").attr("name", originalTitle);   // save the title
    $("#editModal").modal("show");      // pop the edit modal
    this.homeTable.draw(false);
};

// delete the selected row from the table and the corresponding book from the library
page.prototype.iconDeleteRow = function (e) {
    var tableRow = $(e.currentTarget).parent().parent("tr");
    var title = tableRow.children("td:nth-child(2)").text();
    if( confirm("Are you sure you want to delete \"" + title + "\" ?") ) {
        this.lib.removeBookByTitle(title);
        this.lib.saveLibraryToLocalStorage();
        this.homeTable.row(tableRow).remove();
        this.homeTable.draw(false);
    }
};

$(function () {
    window.page = new page();
    window.page.init();
});