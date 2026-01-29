using Microsoft.AspNetCore.Mvc;

namespace TaskFlow.API.Controllers
{
    public class TasksController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
