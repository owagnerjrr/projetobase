import { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function MinhasMarcacoes() {
  const [telefone, setTelefone] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);

  const buscarAgendamentos = async () => {
    const snapshot = await getDocs(collection(db, "appointments"));

    const lista = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(a => a.telefone === telefone);

    setAgendamentos(lista);
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

        <button
          onClick={buscarAgendamentos}
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
          Buscar
        </button>

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
            <p>📅 {a.data}</p>
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