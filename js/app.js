var app = {
    worker: new Worker("js/sql.js"),
    database: {
        output: function(){
            return "data:text/csv;charset=utf-8,FOO,BAR,BAZ"
        }
    }
};
$(function() {
    $("main").tabs();
    $("#save-button").button({
        text: false,
      	icons: {
        	primary: "ui-icon-disk"
      	}
    }).click(function(){
       	$("#save-panel").dialog({
        	resizable: false,
        	height: 200,
            width: 400,
        	modal: true,
    	});
    });
    $("#save-link").button().mousedown(function(){
        $(this).attr({
            href: app.database.output(),
            download: $("#output-filename").val() + "." + $("#output-filetype").val()
        });
    });
});
