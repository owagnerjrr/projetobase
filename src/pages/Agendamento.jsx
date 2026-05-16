import { useParams } from "react-router-dom";
import { useState } from "react";
import TimeSlots from "../components/TimeSlots";
import { criarAgendamento } from "../services/api";

export default function Agendamento() {
  const { serviceId } = useParams();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [horario, setHorario] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 AQUI ESTÁ O HANDLESUBMIT (VOCÊ NÃO TINHA)
  const handleSubmit = async () => {
    if (!nome || !telefone || !horario) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      console.log("🔥 ENVIANDO...");

      const id = await criarAgendamento({
        nome,
        telefone,
        horario,
        serviceId,
        criadoEm: new Date(),
      });

      console.log("🔥 ID GERADO:", id);

      alert("Agendamento salvo com sucesso!");

      // limpar formulário
      setNome("");
      setTelefone("");
      setHorario(null);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar agendamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Agendamento</h1>

      <input
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <input
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
      />

      <h3>Escolha um horário:</h3>

      <TimeSlots onSelect={setHorario} />

      {horario && <p>Horário selecionado: {horario}</p>}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Salvando..." : "Continuar"}
      </button>
    </div>
  );
}