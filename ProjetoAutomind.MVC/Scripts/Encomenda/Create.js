$(function () {
    //Máscara para o campo
    $('.money').mask('000,00', { reverse: true });

    if (localStorage.getItem("listaEncomendas")) {
        preencherGrid();
    }

    $('#btnAdicionar').on("click", function () {
        if ($('#Identificador').val().trim() != "" && $('#Volume').val().trim() != "" && $('#ValorFrete').val().trim() != "") {
            var newRowContent = gerarLinha();

            if (newRowContent != "") {
                $(".table tbody").append(newRowContent);
                limparCampos();
            }
        } else {
            $.alert('Todos os campos são obrigatórios!');
        }

        $('#Identificador').focus();
    });

    $('#btnCalcular').on("click", function () {
        var arrayEncomendas = JSON.parse(localStorage.getItem("listaEncomendas"));

        if (arrayEncomendas.length == 0) {
            $.alert('É necessário adicionar uma encomenda!');
        } else if ($('#VolumeCaminhao').val().trim() == '') {
            $.alert('É necessário informar um volume!');
        } else if (parseFloat($('#VolumeCaminhao').val().trim()) == NaN) {
            $.alert('Informe um volume válido!');
        } else {
            var dados = { VolumeCaminhao: $('#VolumeCaminhao').val().trim(), Encomendas: arrayEncomendas };

            $.post("encomenda/EncontrarValorMaximo", dados)
                .done(function (data) {
                    if (data.split(';')[0] != "")
                        $.alert("A(s) encomenda(s) selecionada(s) de maior valor: " + data.split(';')[0] + "<br/>" + "O maior valor possível para o caminhão: " + data.split(';')[1]);
                    else
                        $.alert("Nenhuma encomenda poderá preencher o volume do caminhão!");
                });
        }
    });
});

function existeRegistro(element) {
    return element.Identificador == $('#Identificador').val();
}

function gerarLinha() {
    var linha = '';

    if (!localStorage.getItem("listaEncomendas"))
        localStorage.setItem("listaEncomendas", JSON.stringify([]));

    var arrayEncomendas = JSON.parse(localStorage.getItem("listaEncomendas"));
    var element = { Identificador: $('#Identificador').val().trim(), Volume: $('#Volume').val().trim(), ValorFrete: $('#ValorFrete').val().trim() };

    if (!arrayEncomendas.some(existeRegistro)) {
        arrayEncomendas.push(element);
        localStorage.setItem("listaEncomendas", JSON.stringify(arrayEncomendas));

        linha = '<tr> <th scope="row">' + arrayEncomendas.length + '</th>' + '<td>' + $('#Identificador').val().trim() + '</td>' + '<td>' + $('#Volume').val().trim() + '</td>' + '<td>' + $('#ValorFrete').val().trim() + '</td>' + '<td><a href="#" onclick="removerRegistro(\'' + $('#Identificador').val().trim() + '\')">Delete</a></td>';
    } else {
        alert('Já existe uma encomenda com o mesmo identificador!');
    }

    return linha;
}

function limparCampos() {
    $('#Identificador').val("");
    $('#Volume').val("");
    $('#ValorFrete').val("");
}

function preencherGrid() {
    var arrayEncomendas = JSON.parse(localStorage.getItem("listaEncomendas"));

    $(".table tbody tr").remove();

    $(arrayEncomendas).each(function (index) {
        var newRowContent = '<tr> <th scope="row">' + (index + 1) + '</th>' + '<td>' + this.Identificador + '</td>' + '<td>' + this.Volume + '</td>' + '<td>' + this.ValorFrete + '</td>' + '<td><a href="#" onclick="removerRegistro(\'' + this.Identificador + '\')">Delete</a></td>';

        $(".table tbody").append(newRowContent);
    });
}

function removerRegistro(identificador) {
    $.confirm({
        title: 'Exclusão',
        content: 'Deseja remover este registro?',
        buttons: {
            sim: function () {
                var rowIndex = -1;
                var arrayEncomendas = JSON.parse(localStorage.getItem("listaEncomendas"));

                $(arrayEncomendas).each(function (index) {
                    if (this.Identificador == identificador) {
                        rowIndex = index;
                        return false;
                    }
                });

                if (rowIndex > -1) {
                    arrayEncomendas.splice(rowIndex, 1);
                    localStorage.setItem("listaEncomendas", JSON.stringify(arrayEncomendas));
                    preencherGrid();
                }

                $.alert('Registro removido com sucesso!');
            },
            não: function () {
            }
        }
    });
}