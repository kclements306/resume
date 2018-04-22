
var lib = new library("one");

$(document).ready( function() {
    lib.getLibraryFromLocalStorage();
 
    // lib.books.forEach( function(book) {
    //     console.log(book);
    // });

    var homeTable = $("#displayTable").DataTable( {
        data: lib.books,
        columns: [
            { data: "author" },
            { data: "title" },
            { data: "numPages" },
            { data: "pubDate", render: function(data, type, row, meta) {
                return data.toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"}); }
            },
            { "orderable": false, data: "icons", render: function(data, type, row, meta) {
                return ('<a href="javascript:deleteRow(' + row + ')"> <img class="delete" src="images/update.png"> ' +
                '<a href="javascript:deleteRow(' + row + ')"> <img class="delete" src="images/delete.png">')
            }}
        ]
    });

    var addTable = $("#addModalTable").DataTable( {
        
    });

    // $(".modal-content").resizable({
    //     alsoResize: ".modal-header, .modal-body, .modal-footer"
    // });
    // $("modal-diaglog").draggable();
    $("#btnAddABook").on ( "click", function() {
        addTable.row.add( [
            $(".inpAuthor").val(),
            $(".inpTitle").val(),
            $(".inpNumPages").val(),
            $(".inpPubDate").val()
        ] ).draw( false );
    } );

    $(".addTableBody").on( "click", ".addTableBody", function () {
        addTable.cell( this ).edit();
    } );
});