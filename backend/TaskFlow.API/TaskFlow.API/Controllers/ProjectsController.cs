using Microsoft.AspNetCore.Mvc;

namespace TaskFlow.API.Controllers
{
    public class ProjectsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
