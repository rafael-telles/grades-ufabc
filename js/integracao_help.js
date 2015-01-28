var helpData = (function() {
    var ret = {};
    $.ajax({
        url: "ajax/lista-completa.xml",
        dataType: "xml",
        async: false,
        success: function(xmlResponse) {
            ret = $("r", xmlResponse).map(function() { //r = resultado
                if ($("c", this).text() != "") { //c = codigo
                    return {
                        value: "(" + $("c", this).text() + ") " + $("n", this).text(),
                        id: $("i", this).text(), //i = id
                        codigo: $("c", this).text(),
                        tipo: $("t", this).text()

                    };
                }
            }).get();
        }
    });
    return ret;
})();

var linkHelp = function(d) {
    for (var i in helpData) {
        if (helpData[i].codigo == d.codigo) {
            return 'http://www.ufabchelp.me/painel/disciplina.php?i=' + helpData[i].id;
        }
    }
};