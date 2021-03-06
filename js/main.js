$("#error-alert").hide();
$("#output-warning").hide();
$("#output-error").hide();
$("#result").hide();

Dropzone.options.dropZone = {
    acceptedFiles: ".svg",
    init: function () {

        this.on("addedfile", function (file) {
            $("#error-alert").fadeOut("fast");
            $("#output-warning").fadeOut("fast");
            $("#output-error").fadeOut("fast");
            $("#result").fadeOut("fast");
            $("#lib-button").parent().andSelf().addClass("disabled");
            $("#fix-fill-type").attr("disabled", true);

            while (this.files[1]) {
                this.removeFile(this.files[0]);
            }

            if (yaCounter32422355) {
                yaCounter32422355.reachGoal('addedfile', { lib: $("#lib").text() });
            }
        });

        this.on("success", function (file, response) {
            var output = response.output.trim();
            if (output.length > 0) {
                var message = output.substring(output.indexOf(":") + 1).trim();

                output = output.replace("[", "<strong>").replace("]", "!</strong>");
                output = output.replace(/(\r\n|\r|\n)/g, "<br />");
                output = recognizeLinks(output);
                if (output.match(/\Werror/i)) {
                    $("#output-error").html(output);
                    $("#output-error").fadeIn();

                    if (yaCounter32422355) {
                        yaCounter32422355.reachGoal('success-error', { success_error: message });
                    }
                } else {
                    if (output.match(/Try specifying the --fix-fill-type option/)) {
                        output = '<div><p>' + output + '</p></div><button type="button" class="btn btn-warning" onclick="checkFixFillType()">Specify --fix-fill-type</button>';
                    }
                    $("#output-warning").html(output);
                    $("#output-warning").fadeIn();

                    if (yaCounter32422355) {
                        yaCounter32422355.reachGoal('success-warning', { success_warning: message });
                    }
                }
            } else {
                if (yaCounter32422355) {
                    yaCounter32422355.reachGoal('success-ok');
                }
            }

            if (response.result.length > 0) {
                $("#result-name").text(response.result[0].name);
                $("#result-data").text(response.result[0].data);
                $("#result").fadeIn();

                $("#result-data").removeClass("prettyprinted");
                PR.prettyPrint();
            }
        });

        this.on("error", function (file, errorMessage, xhr) {
            $("#error-alert").html('<div><p>' + errorMessage + '</p></div><button type="button" class="btn btn-danger" onclick="resubmit()">Retry</button>');
            $("#error-alert").fadeIn();

            if (yaCounter32422355) {
                yaCounter32422355.reachGoal('error', { error_message: errorMessage });
            }
        });

        this.on("canceled", function (file) {
            $("#error-alert").hide();
        });

        this.on("queuecomplete", function () {
            $("#lib-button").parent().andSelf().removeClass("disabled");
            $("#fix-fill-type").attr("disabled", false);
        });

    }
};

function resubmit() {
    var dropZone = Dropzone.forElement("#drop-zone");
    var file = dropZone.files[0];
    if (file) {
        dropZone.removeAllFiles(true);
        dropZone.addFile(file);
    }
}

function changeLib(sender) {
    var text = $(sender).text();
    var lib = $("#lib");
    if (lib.text() !== text) {
        lib.text(text);
        $("[name='lib']").val(sender.id == "lib-default" ? "" : text);
        resubmit();
    }
}

function updateFixFillTypeVisibility() {
    if (Cookies.get("used-fix-fill-type")) {
        $("#fix-fill-type-form").fadeIn();
    } else {
        $("#fix-fill-type-form").hide();
    }
}

function changeFixFillType(used) {
    var checked = $("#fix-fill-type").prop("checked");
    $("[name='fix-fill-type']").val(checked ? "on" : "off");
    if (used) {
        Cookies.set("used-fix-fill-type", true);
    }
    updateFixFillTypeVisibility();
    resubmit();
}

window.onload = function () {
    changeLib($("#lib-default")[0]);
    changeFixFillType(false);
};

function checkFixFillType() {
    $("#fix-fill-type").prop("checked", true);
    changeFixFillType(true);
}

function saveToFile() {
    var blob = new Blob([$("#result-data").text()], { type: "text/xml;charset=utf-8" });
    saveAs(blob, $("#result-name").text(), true);
}

function selectCode() {
    var text = $("#result-data")[0];
    if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function recognizeLinks(html) {
    var regex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return html.replace(regex, function (url) {
        return '<a href="' + url + '" class="alert-link">' + url + '</a>';
    });
}
