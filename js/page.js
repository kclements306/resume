
var lib = new library("one");

$(document).ready( function() {
    lib.getLibraryFromLocalStorage();
    lib.books.forEach( function(book) {
        console.log(book);
    });
    $("#displayTable").DataTable();
    var _this = this;

    $("#formAddABook").on("submit", function() {
        var book;
        var inputs = $("#formAddABook :input"); 
        book = new Book({title: inputs[1].value, author: inputs[0].value, numPages: inputs[2].value, 
            pubDate: new Date(inputs[3].value)});
        _this.lib.addBook(book);
    });
});