
var lib = new library("one");

$(document).ready( function() {
    lib.getLibraryFromLocalStorage();
    // lib.books.forEach( function(book) {
    //     console.log(book);
    // });

    $("#displayTable").DataTable( {
        data: this.books,
        columns: [
            { data: "author" },
            { data: "title" },
            { data: "numPages" },
            { data: "pubDate"}
        ]
    });
    var _this = this;

    function createBookDisplayTable () {
        var bookCount = 0;
        var nodeClass = ".dataRow0";
        var originalDataRow = $(nodeClass);
        var tableRow = originalDataRow.cloneNode(true);
        lib.books.forEach( function (book) {
            tableRow.children("author").data = book.author;
            tableRow.children("title").data = book.title;
            tableRow.children("numPages").data = book.numPages;
            tableRow.children("pubDate").data = book.pubDate.toDateString;
            $(".tableBody").append(tableRow);
            tableRow = originalDataRow.cloneNode(true);
        });

        return true;
    }

    $("#formAddABook").on("submit", function() {
        var book;
        var inputs = $("#formAddABook :input"); 
        book = new Book({title: inputs[1].value, author: inputs[0].value, numPages: inputs[2].value, 
            pubDate: new Date(inputs[3].value)});
        _this.lib.addBook(book);
    });
});