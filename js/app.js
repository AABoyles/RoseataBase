var app = {
    worker: new Worker("js/sql.js"),
    database: {},
    query: function(commands, callback) {
		app.worker.onmessage = callback;
		app.worker.postMessage({action:'exec', sql:commands});
    },
    ingest: function() {
        switch($('#file').get(0).files[0].type) {
            case "application/vnd.ms-excel":
				app.readXLS();
                break;
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
				app.readXLSX();
                break;
            case "application/x-sqlite3":
            case "text/x-adasrc":
            default:
                app.readDB();
                break;
        }
    },
    readXLS: function(){},
    readXLSX: function(){},
    readDB: function() {
        var f =  $('#file').get(0).files[0];
        var r = new FileReader();
        r.onload = function() {
            app.worker.onmessage = function() {
                app.query("SELECT `name` FROM `sqlite_master`\n  WHERE type='table';", function(evt){
                    console.log(evt);
                });
            };
            try {
                app.worker.postMessage({
                    action: 'open',
                    buffer: r.result
                }, [r.result]);
            } catch(exception) {
                app.worker.postMessage({
                    action: 'open',
                    buffer: r.result
                });
            }
        }
        r.readAsArrayBuffer(f);
    },
    saveDB: function() {
		app.worker.onmessage = function(event) {
			var arraybuff = event.data.buffer;
			var blob = new Blob([arraybuff]);
			var url = window.URL.createObjectURL(blob);
	        $("#save-link").attr("href", url);
		};
        app.worker.postMessage({action:'export'});
    },
    output: function() {
        switch($("#output-filetype").val()){
            case "xls":
            case "xlsx":
            case "csv":
            case "tsv":
            case "sqlite":
            	app.saveDB();
            break;
        }
    }
};
$(function() {
    $("main").tabs();
    $('#file').change(app.ingest);
    $("#save-button").button({
        text: false,
        icons: {
            primary: "ui-icon-disk"
        }
    }).click(function() {
        $("#save-panel").dialog({
            resizable: false,
            height: 200,
            width: 400,
            modal: true,
        });
        app.output();
    });
    $("#save-link").button();
    $("#output-filename").change(function() {
        $("#save-link").attr("download", $("#output-filename").val() + "." + $("#output-filetype").val());
    });
    $("#output-filetype").change(function() {
        $("#save-link").attr("download", $("#output-filename").val() + "." + $("#output-filetype").val());
        app.output();
    });
});
