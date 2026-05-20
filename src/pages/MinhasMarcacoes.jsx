import { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { confirmPhonePin, sendPhonePin } from "../services/phoneAuth";

const formatarData = (data) => {
  if (!data) return "";

  if (data.includes("/")) return data;

  const [ano, mes, dia] = data.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
};

export default function MinhasMarcacoes() {
  const [telefone, setTelefone] = useState("");
  const [telefoneVerificado, setTelefoneVerificado] = useState("");
  const [pin, setPin] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [pinEnviado, setPinEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);

  const enviarPin = async () => {
    try {
      setLoading(true);
      const result = await sendPhonePin(telefone, "minhas-marcacoes-recaptcha");
      setConfirmationResult(result.confirmationResult);
      setTelefoneVerificado(result.phoneNumber);
      setPinEnviado(true);
      alert("PIN enviado por SMS.");
    } catch (error) {
      console.error("Erro ao enviar PIN:", error);
      alert(error.message || "Erro ao enviar PIN");
    } finally {
      setLoading(false);
    }
  };

  const buscarAgendamentos = async (phone = telefoneVerificado) => {
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("telefone", "==", phone)
    );

    const snapshot = await getDocs(appointmentsQuery);
    const lista = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

    setAgendamentos(lista);
  };

  const confirmarPin = async () => {
    try {
      setLoading(true);
      const user = await confirmPhonePin(confirmationResult, pin);
      await buscarAgendamentos(user.phoneNumber);
    } catch (error) {
      console.error("Erro ao confirmar PIN:", error);
      alert(error.message || "PIN invalido");
    } finally {
      setLoading(false);
    }
  };

  const cancelar = async (id) => {
    await deleteDoc(doc(db, "appointments", id));
    buscarAgendamentos();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#e6e6e6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial"
    }}>

      <div style={{
        background: "#bfa3c9",
        padding: "40px",
        borderRadius: "20px",
        width: "90%",
        maxWidth: "420px",
        textAlign: "center",
        color: "#4b2c52"
      }}>

        <h1 style={{ marginBottom: "20px" }}>
          Meus Agendamentos
        </h1>

        <input
          placeholder="Digite seu telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "20px",
            border: "2px solid #4b2c52",
            background: "#fff",
            color: "#000",
            marginBottom: "15px",
            textAlign: "center"
          }}
        />

        <div id="minhas-marcacoes-recaptcha" />

        {!pinEnviado ? (
          <button
            onClick={enviarPin}
            disabled={loading}
            style={{
              background: "#2c6e6e",
              color: "#fff",
              padding: "10px",
              borderRadius: "20px",
              border: "none",
              fontWeight: "bold",
              width: "100%",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            {loading ? "Enviando..." : "Enviar PIN"}
          </button>
        ) : (
          <>
            <input
              placeholder="PIN recebido por SMS"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputMode="numeric"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "20px",
                border: "2px solid #4b2c52",
                background: "#fff",
                color: "#000",
                marginBottom: "15px",
                textAlign: "center"
              }}
            />

            <button
              onClick={confirmarPin}
              disabled={loading}
              style={{
                background: "#2c6e6e",
                color: "#fff",
                padding: "10px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "bold",
                width: "100%",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              {loading ? "Buscando..." : "Confirmar e buscar"}
            </button>
          </>
        )}

        <button
          onClick={() => window.location.href = "/"}
          style={{
            background: "#9b59b6",
            color: "#fff",
            padding: "10px",
            borderRadius: "20px",
            border: "none",
            width: "100%",
            marginTop: "10px",
            cursor: "pointer"
          }}
        >
          Voltar
        </button>

        {agendamentos.length === 0 && (
          <p style={{ marginTop: "15px", color: "#4b2c52" }}>
            Nenhum agendamento encontrado
          </p>
        )}

        {agendamentos.map((a) => (
          <div key={a.id} style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "15px",
            marginTop: "15px",
            border: "2px solid #9b59b6",
            textAlign: "left"
          }}>
            <h3 style={{ color: "#4b2c52" }}>{a.servico}</h3>
            <p>📅 {formatarData(a.data)}</p>
            <p>⏰ {a.hora}</p>

            <button
              onClick={() => cancelar(a.id)}
              style={{
                marginTop: "10px",
                background: "#e74c3c",
                color: "#fff",
                padding: "8px",
                borderRadius: "10px",
                width: "100%",
                border: "none",
                cursor: "pointer"
              }}
            >
              Cancelar
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}
