import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Agendamento from "./pages/Agendamento";
import Cliente from "./pages/Cliente";
import MinhasMarcacoes from "./pages/MinhasMarcacoes";
import Admin from "./pages/Admin";
import { siteConfig } from "./config/siteConfig";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cliente />} />
        <Route path={siteConfig.routes.publicAlias} element={<Cliente />} />
        <Route path="/home" element={<Home />} />
        <Route path="/agendamento/:serviceId" element={<Agendamento />} />
        <Route path={siteConfig.routes.appointments} element={<MinhasMarcacoes />} />
        <Route path={siteConfig.routes.admin} element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
