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
                    // return ("<i class=\"material-icons editRow mx-2\">create</i> " + "<i class=\"material-icons deleteRow\">delete</i>");
                    return ("<img src=\"images/edit.png\" class=\"editRow mx2\"> <img src=\"images/delete.png\" class=\"deleteRow\">");
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
    // $(this).find(".modal-body").css({
    //     "max-height": "100%"
    // });
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
    this.addTable.row.add([ author, title, numPages, pubDate ]).draw(false);
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
    // lib.removeBookByTitle(originalTitle);
    this.lib.addBook(book);
    this.lib.saveLibraryToLocalStorage();
    location.reload(false);
};

page.prototype.btnDeleteByAuthor = function () {
    var author = $(this).text();
    if (confirm("Are you sure you want to delete all the books by " + author + " ?")) {
        this.lib.removeBooksByAuthor(author);
        this.lib.saveLibraryToLocalStorage();
        location.reload(false);
    }
};

// edit Author or Title in row
page.prototype.iconEditAuthorAndTitle = function (e) {
    var t0 = $(e.currentTarget).parent();
    console.log("$(e.currentTarget).parent():" + t0);
    var t1 = t0.parent();
    console.log("t0.parent():" + t1);
    var $tr = $(e.currentTarget).parent().parent().parent("tr"); // get parent tr
    console.log($tr);

    // var author = $(parsedHTML[0]).html();
    // var originalTitle = $(parsedHTML[1]).html();
    // $("#editModalAuthor").text(author);
    // $("#editModalTitle").text(originalTitle);
    // $("#editModalTitle").attr("name", originalTitle);
    // $("#editModal").modal("show");

    // var parsedHTML = $.parseHTML(this.parents("tr").html());
    
    // var author = $(parsedHTML[0]).html();
    // var originalTitle = $(parsedHTML[1]).html();
    // $("#editModalAuthor").text(author);
    // $("#editModalTitle").text(originalTitle);
    // $("#editModalTitle").attr("name", originalTitle);
    // $("#editModal").modal("show");
    // $(".dt-edit").each( function () {
    // $(this).on("click", function (evt){
    //     $this = $(this);
    //     var parsedHTML = $.parseHTML($this.parents("tr").html());
    //     var author = $(parsedHTML[0]).html();
    //     var originalTitle = $(parsedHTML[1]).html();
    //     $("#editModalAuthor").text(author);
    //     $("#editModalTitle").text(originalTitle);
    //     $("#editModalTitle").attr("name", originalTitle);
    //     $("#editModal").modal("show");
    // });
};

// delete row
page.prototype.iconDeleteRow = function (e) {
    var $tr = $(e.currentTarget).parent("tr");
    console.log($tr);
    this.bookArr.splice($tr.attr("data-id"), 1);
    $tr.remove();
    // $(".dt-delete").each( function () {
    // $(this).on("click", function() {
    //     $this = $(this);
    //     var parsedHTML = $.parseHTML($this.parents("tr").html());
    //     var title = $(parsedHTML[1]).html();
    //     if( confirm("Are you sure you want to delete this row?") ) {
    //         this.lib.removeBookByTitle(title);
    //         this.lib.saveLibraryToLocalStorage();
    //         location.reload(false);
    //     }
    // });
};

$(function () {
    window.page = new page();
    window.page.init();
});