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

var app = angular.module("MontadorDeGrades", []);

app.controller("MontadorController", function($scope, $http) {

    $scope.escolhidas = disciplinasEscolhidas;
    $scope.resultados = buscarDisciplinas();
    $scope.ocultar = true;
    $scope.buscar = function(e) {
        var busca = buscarDisciplinas(e.busca);
        if ($scope.ocultar) {
            $scope.resultados = [];
            for (var i in busca) {
                if ($scope.classeDisciplina({
                        disciplina: busca[i]
                    }) != 'danger') {
                    $scope.resultados.push(busca[i]);
                }
            }
        } else {
            $scope.resultados = busca;
        }
    };

    $scope.checkboxClick = function(e) {
        if (e.disciplina.escolhida) {
            disciplinasEscolhidas.push(e.disciplina);
        } else {
            for (var i = disciplinasEscolhidas.length - 1; i >= 0; i--) {
                if (disciplinasEscolhidas[i] === e.disciplina) {
                    disciplinasEscolhidas.splice(i, 1);
                }
            }
        }

        atualizarGrade();
    };

    $scope.classeDisciplina = function(e) {
        for (var i in disciplinasEscolhidas) {
            if (e.disciplina == disciplinasEscolhidas[i]) {
                return "success";
            }
            if (verificarConflito(e.disciplina, disciplinasEscolhidas[i])) {
                return "danger";
            }
        }
        return "";
    };

    $scope.linkHelp = function(d) {
        return linkHelp(d);
    }

    $scope.contarCreditos = function() {
        var ret = 0;
        for (var i in disciplinasEscolhidas) {
            ret += disciplinasEscolhidas[i].creditos;
        }

        return ret;
    }

    $scope.limparGrade = function() {
        for (var i in disciplinasEscolhidas) {
            disciplinasEscolhidas[i].escolhida = false;
        }

        disciplinasEscolhidas = [];

        atualizarGrade();
    }
});
