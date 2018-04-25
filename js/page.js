var lib = new library("one");
var booksToAdd = [];
$( function() {
    
    lib.getLibraryFromLocalStorage();
    var homeTable = $("#displayTable").DataTable( {
        pageResize: true,
        autowidth: false,
        data: lib.books,
        columns: [
            { data: "author" },
            { data: "title" },
            { data: "numPages" },
            { data: "pubDate", render: function(data, type, row, meta) {
                return data.toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"}); } },
            { orderable: false, data: "icons", render: function(data, type, row, meta) {
                return (
                    "<button type=\"button\" class=\"btn btn-primary btn-xs dt-edit m-2\">" + 
                        "<i class=\"material-icons\">create</i>" +
                    "</button>" +
                    "<button type=\"button\" class=\"btn btn-danger btn-xs dt-delete\">" +
                        "<i class=\"material-icons\">delete</i>" +
                    "</button>" );
            } }
        ]
    });

    var addTable = $("#addModalTable").DataTable( {
        pageResize: true
    });

    // Add a book to global array booksToAdd
    $("#btnAddABook").on ( "click", function() {
        // save the values that were inputted
        var jsonBook = {};
        var author =  $(".inpAuthor").val();
        var title = $(".inpTitle").val();
        var numPages = $(".inpNumPages").val();
        var pubDate = $(".inpPubDate").val();
        jsonBook["author"] = author;
        jsonBook["title"] = title;
        jsonBook["numPages"] = numPages;
        jsonBook["pubDate"] = pubDate; 
        booksToAdd.push(new Book(jsonBook));
        // clear the input tags to show the placeholder value
        $(".inpAuthor").val("");
        $(".inpTitle").val("");
        $(".inpNumPages").val("");
        $(".inpPubDate").val("");
        // add the book to the modal table
        addTable.row.add( [
            author,
            title,
            numPages,
            pubDate
        ] ).draw( false );
    } );

    // Save all books in booksToAdd array to library.books array
    $("#btnSaveBooks").on ( "click", function() {
        lib.addBooks(booksToAdd);   //add the new books
        lib.saveLibraryToLocalStorage();
        addTable.clear();   // empty the add books modal table
        // clear the input tags to show the placeholder value
        $(".inpAuthor").val("");
        $(".inpTitle").val("");
        $(".inpNumPages").val("");
        $(".inpPubDate").val("");
        location.reload(false); // reload the new library
    } );

    $(".addTableBody").on( "click", ".addTableBody", function () {
        addTable.cell( this ).edit();
    } );

    $(".modal-content").resizable({
        //alsoResize: ".modal-dialog",
        minHeight: 100,
        minWidth: 100
    });

    $(".modal-dialog").draggable();

    $("#addModal").on("show.bs.modal", function() {
        booksToAdd = [];
        $(this).find(".modal-body").css({
            "max-height": "100%"
        });
    });

    $("#showAllAuthorsModal").on("show.bs.modal", function() {
        $("#authorsToDeleteHTML").remove();
        var insertString = "<div id=\"authorsToDeleteHTML\">";
        var authors = lib.getAuthors();
        authors.forEach( function (author) {
            // insertString = insertString + "<p class=\"authorToDelete\">" + author + "</p>";
            insertString = insertString + "<button type=\"button\" class=\"btn btn-outline-secondary authorToDelete\">" + author + "</button>";
        });
        insertString = insertString + "</div>";
        $(insertString).insertAfter("#authorsMarker");
    });

    // $("button.authorToDelete").on ( "click", function() {
    $(document).on("click", ".authorToDelete", function(){
        var author = $(this).text();
        if( confirm("Are you sure you want to delete all the books by " + author + " ?")) {
            lib.removeBooksByAuthor(author);
            lib.saveLibraryToLocalStorage();
            location.reload(false);
        } 
    });

    // Grab a random book to recommend
    $("#recommendModal").on ("show.bs.modal", function() {
        var book = lib.getRandomBook();
        $("#imgRecommendImage").attr("src", "images/" + book.title + ".jpg");
        $("#pRecommendTitle").text(book.title);
        $("#pRecommendAuthor").text(book.author);
        $("#pRecommendNumPages").text(book.numPages);
        $("#pRecommendPubDate").text(book.pubDate.toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"}));
    });

    // Edit Author or Title
    $(".dt-edit").each( function () {
        $(this).on("click", function (evt){
            $this = $(this);
            var parsedHTML = $.parseHTML($this.parents("tr").html());
            var author = $(parsedHTML[0]).html();
            var originalTitle = $(parsedHTML[1]).html();
            $("#editModalAuthor").text(author);
            $("#editModalTitle").text(originalTitle);
            $("#editModalTitle").attr("name", originalTitle);
            $("#editModal").modal("show");
        });
    });

    $("#btnSaveEdit").on ("click", function() {
        var author = $("#editModalAuthor").val();
        var title = $("#editModalTitle").val();
        var originalTitle = $("#editModalTitle").attr("name");
        var books = lib.getBookByTitle(originalTitle);
        var book = books[0];
        book.author = author;
        book.title = title;
        // lib.removeBookByTitle(originalTitle);
        lib.addBook(book);
        lib.saveLibraryToLocalStorage();
        location.reload(false);
    });

    // Delete Row
    $(".dt-delete").each( function () {
        $(this).on("click", function(evt) {
            $this = $(this);
            var parsedHTML = $.parseHTML($this.parents("tr").html());
            var title = $(parsedHTML[1]).html();
            if( confirm("Are you sure you want to delete this row?") ) {
                lib.removeBookByTitle(title);
                lib.saveLibraryToLocalStorage();
                location.reload(false);
            }
        });
    });
});