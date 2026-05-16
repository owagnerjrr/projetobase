import ServiceCard from "../components/ServiceCard";
import { siteConfig } from "../config/siteConfig";

const services = [
  {
    id: "limpeza_pele",
    nome: "Limpeza de Pele",
    preco: 200,
  },
  {
    id: "massagem",
    nome: "Massagem Relaxante",
    preco: 150,
  },
];

export default function Home() {
  return (
    <div className="container">
      <h1>{siteConfig.brandName}</h1>
      <p>{siteConfig.subtitle}</p>

      <div className="grid">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
