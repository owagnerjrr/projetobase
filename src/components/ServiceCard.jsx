import { useNavigate } from "react-router-dom";

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h2>{service.nome}</h2>
      <p>{service.preco}</p>

      <button onClick={() => navigate(`/agendamento/${service.id}`)}>
        Agendamento
      </button>
    </div>
  );
}
