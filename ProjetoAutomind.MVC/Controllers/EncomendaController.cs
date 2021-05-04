using System.Collections.Generic;
using ProjetoAutomind.MVC.Models;
using System.Web.Mvc;
using System.Linq;
using System;

namespace ProjetoAutomind.MVC.Controllers
{
    public class EncomendaController : Controller
    {
        public ActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public JsonResult EncontrarValorMaximo(EncomendasJSON encomendasJson)
        {
            string resposta = string.Empty;

            if (encomendasJson != null)
            {
                resposta = ExtrairValorMaximoId(encomendasJson);
            }

            return Json(resposta, JsonRequestBehavior.AllowGet);
        }

        private Dictionary<string, Encomenda> AtualizaValorMaximoId(EncomendasJSON encomendasJson, ref decimal valorMaximo, ref string identificadorEleito)
        {
            Dictionary<string, Encomenda> colDados = new Dictionary<string, Encomenda>();

            foreach (var item in encomendasJson.Encomendas)
            {
                if (item.Volume <= encomendasJson.VolumeCaminhao && !colDados.ContainsKey(item.Identificador))
                {
                    colDados.Add(item.Identificador, item);

                    if (item.ValorFrete > valorMaximo)
                    {
                        identificadorEleito = item.Identificador;
                        valorMaximo = item.ValorFrete;
                    }
                }
            }

            return colDados;
        }

        private string ExtrairValorMaximoId(EncomendasJSON encomendasJson)
        {
            decimal valorMaximo = 0;
            string identificadorEscolhido = string.Empty;
            Dictionary<string, Encomenda> colDados = new Dictionary<string, Encomenda>();

            encomendasJson.Encomendas.RemoveAll(x => x.Volume > encomendasJson.VolumeCaminhao);

            //Define o resultado
            colDados = AtualizaValorMaximoId(encomendasJson, ref valorMaximo, ref identificadorEscolhido);

            //Ajustando o resultado final
            for (int j = 0; j < encomendasJson.Encomendas.Count; j++)
            {
                bool incluiu = false;
                Dictionary<string, Encomenda> colDadosAux = new Dictionary<string, Encomenda>();

                foreach (var item in colDados)
                {
                    bool valido = true;
                    string[] identificadores = item.Key.Split('-');
                    Encomenda encomendaLoop = encomendasJson.Encomendas[j];

                    //Verifica se já existe o identificador
                    foreach (var identificador in identificadores)
                    {
                        if (identificador == encomendaLoop.Identificador)
                        {
                            valido = false;
                            break;
                        }
                    }

                    if (valido)
                    {
                        //Analisa se pode incluir a encomenda no loop existente
                        if (item.Value.Volume + encomendaLoop.Volume <= encomendasJson.VolumeCaminhao)
                        {
                            Encomenda novaEncomenda = new Encomenda();
                            novaEncomenda.Identificador = item.Value.Identificador + "-" + encomendaLoop.Identificador;
                            novaEncomenda.Volume = item.Value.Volume + encomendaLoop.Volume;
                            novaEncomenda.ValorFrete = item.Value.ValorFrete + encomendaLoop.ValorFrete;

                            colDadosAux.Add(novaEncomenda.Identificador, novaEncomenda);

                            if (novaEncomenda.ValorFrete > valorMaximo)
                            {
                                identificadorEscolhido = novaEncomenda.Identificador;
                                valorMaximo = novaEncomenda.ValorFrete;
                            }

                            incluiu = true;
                        }
                    }
                }

                //Concatena os novos com lista que já existe
                if (incluiu)
                {
                    colDados = colDados.Concat(colDadosAux).GroupBy(d => d.Key)
                        .ToDictionary(d => d.Key, d => d.First().Value);
                }
            }

            return identificadorEscolhido + ";" + valorMaximo;
        }
    }
}