var app = angular.module("MontadorDeGrades", []);

app.controller("MontadorController", function($scope, $http) {

    $scope.escolhidas = disciplinasEscolhidas;
    $scope.ocultar = true;
    $scope.todosResultados = [];
    $scope.resultados = [];
    $scope.buscar = function(e) {
        $scope.numItems = 10;
        var busca = buscarDisciplinas(e.busca);
        if ($scope.ocultar) {
            $scope.todosResultados = [];
            for (var i in busca) {
                if ($scope.classeDisciplina({
                        disciplina: busca[i]
                    }) != 'danger') {
                    $scope.todosResultados.push(busca[i]);
                }
            }
        } else {
            $scope.todosResultados = busca;
        }

        $scope.carregarMais();
    };

    $scope.carregarMais = function() {
        $scope.numItems += 10;
        if($scope.numItems >= $scope.todosResultados.length) {
            $scope.numItems = $scope.todosResultados.length;
        }
        $scope.resultados = []
        for(var i = 0; i < $scope.numItems; i++) {
            $scope.resultados[i] = $scope.todosResultados[i];
        }
        console.log($scope.numItems,$scope.todosResultados.length,$scope.resultados.length);
    }

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

    $scope.gerarCor = function(i) {
        return gerarCor(i);
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

    $scope.removerDisciplina = function(d) {
        disciplinasEscolhidas.splice(d, 1);
        atualizarGrade();
    }

    $scope.buscar({
        busca: ''
    });

    $(window).on('hashchange', function() {
        $scope.$apply(function(){resgatarHash();});
    });
});

app.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});
