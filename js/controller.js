var app = angular.module("MontadorDeGrades", []);

app.filter('offset', function() {
    return function(input, start) {
        start = parseInt(start, 10);
        return input.slice(start);
    };
});

app.controller("MontadorController", function($scope) {

    $scope.escolhidas = disciplinasEscolhidas;
    $scope.resultados = buscarDisciplinas();
    $scope.buscar = function(e) {
        $scope.resultados = buscarDisciplinas(e.busca);
        $scope.setPage(0);
    };

    $scope.itemsPerPage = 6;
    $scope.currentPage = 0;

    $scope.prevPage = function() {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.prevPageDisabled = function() {
        return $scope.currentPage === 0 ? "disabled" : "";
    };

    $scope.pageCount = function() {
        return Math.ceil($scope.resultados.length / $scope.itemsPerPage) - 1;
    };

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.pageCount()) {
            $scope.currentPage++;
        }
    };

    $scope.nextPageDisabled = function() {
        return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
    };

    $scope.setPage = function(n) {
        $scope.currentPage = n;
    };

    $scope.pageCountCurrent = function(n) {
        return $scope.currentPage === n ? "active" : "";
    };

    $scope.range = function() {
        var rangeSize = 10;
        if (rangeSize > $scope.pageCount()) {
            rangeSize = $scope.pageCount() + 1;
        }
        var ret = [];
        var start;

        start = $scope.currentPage - Math.floor(rangeSize / 2);
        if (start < 0) start = 0;
        if (start > $scope.pageCount() - rangeSize) {
            start = $scope.pageCount() - rangeSize + 1;
        }

        for (var i = start; i < start + rangeSize; i++) {
            ret.push(i);
        }
        return ret;
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
        for(var i in disciplinasEscolhidas) {
            if(e.disciplina == disciplinasEscolhidas[i]) {
                return "success";
            }
            if(verificarConflito(e.disciplina, disciplinasEscolhidas[i])) {
                return "danger";
            }
        }
        return "";
    };

    $scope.contarCreditos = function() {
        var ret = 0;
        for(var i in disciplinasEscolhidas) {
            ret += disciplinasEscolhidas[i].creditos;
        }
        
        return ret;
    }
});
