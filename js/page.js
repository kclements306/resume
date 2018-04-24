var lib = new library("one");
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
            // { "orderable": false, data: "icons", render: function(data, type, row, meta) {
            //     return ("<a href=\"javascript:updateRow("+type+");\"> <img class=\"delete\" src=\"images/update2.png\"> " +
            //     "<a href=\"javascript:deleteRow("+type+");\"> <img class=\"delete\" src=\"images/delete.png\">");
            // } }
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

    $(".modal-content").resizable({
        //alsoResize: ".modal-dialog",
        minHeight: 100,
        minWidth: 100
    });

    $(".modal-dialog").draggable();

    $("#addModal").on("show.bs.modal", function() {
        $(this).find(".modal-body").css({
            "max-height": "100%"
        });
    });

    // Edit Author or Title
    $(".dt-edit").each( function () {
        $(this).on("click", function (evt){
            $this = $(this);
            var parsedHTML = $.parseHTML($this.parents("tr").html());
            var author = $(parsedHTML[0]).html();
            var title = $(parsedHTML[1]).html();
            for(var i=0; i < dtRow[0].cells.length; i++){
                $("div.modal-body").append("Cell (column, row) \" + dtRow[0].cells[i]._DT_CellIndex.column+\", \" + dtRow[0].cells[i]._DT_CellIndex.row + \" => innerHTML : \" + dtRow[0].cells[i].innerHTML +\"<br/>");
            }  
            $("#editModal").modal("show");
        });
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