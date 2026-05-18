import { useParams } from "react-router-dom";
import { useState } from "react";
import TimeSlots from "../components/TimeSlots";
import { criarAgendamento } from "../services/api";
import { confirmPhonePin, sendPhonePin } from "../services/phoneAuth";

export default function Agendamento() {
  const { serviceId } = useParams();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [telefoneVerificado, setTelefoneVerificado] = useState("");
  const [horario, setHorario] = useState(null);
  const [pin, setPin] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [pinEnviado, setPinEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendPin = async () => {
    if (!nome || !telefone || !horario) {
      alert("Preencha nome, telefone e horario antes de solicitar o PIN");
      return;
    }

    try {
      setLoading(true);
      const result = await sendPhonePin(telefone, "agendamento-recaptcha");
      setConfirmationResult(result.confirmationResult);
      setTelefoneVerificado(result.phoneNumber);
      setPinEnviado(true);
      alert("PIN enviado por SMS. Digite o codigo para confirmar.");
    } catch (error) {
      console.error("Erro ao enviar PIN:", error);
      alert(error.message || "Erro ao enviar PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!nome || !telefone || !horario || !pin) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      const user = await confirmPhonePin(confirmationResult, pin);

      const id = await criarAgendamento({
        nome,
        telefone: telefoneVerificado || user.phoneNumber,
        horario,
        serviceId,
        criadoEm: new Date(),
        telefoneConfirmado: true,
        firebaseUid: user.uid,
      });

      console.log("ID GERADO:", id);

      alert("Telefone confirmado e agendamento salvo com sucesso!");

      setNome("");
      setTelefone("");
      setTelefoneVerificado("");
      setHorario(null);
      setPin("");
      setConfirmationResult(null);
      setPinEnviado(false);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert(error.message || "Erro ao confirmar PIN e salvar agendamento");
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

      <div id="agendamento-recaptcha" />

      {!pinEnviado ? (
        <button onClick={handleSendPin} disabled={loading}>
          {loading ? "Enviando..." : "Enviar PIN por SMS"}
        </button>
      ) : (
        <>
          <input
            placeholder="PIN recebido por SMS"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
          />

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Confirmando..." : "Confirmar e agendar"}
          </button>
        </>
      )}
    </div>
  );
}
