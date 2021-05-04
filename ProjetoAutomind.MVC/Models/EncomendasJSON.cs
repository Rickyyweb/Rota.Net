using System.Collections.Generic;

namespace ProjetoAutomind.MVC.Models
{
    public class EncomendasJSON
    {
        public decimal VolumeCaminhao { get; set; }
        public List<Encomenda> Encomendas { get; set; }
    }
}