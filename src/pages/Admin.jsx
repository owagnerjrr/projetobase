import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { servicesConfig } from "../config/servicesConfig";

const normalizeText = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const normalizeAppointmentDate = (value) => {
  if (!value) return "";
  if (value.includes("/")) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  return value;
};

export default function Admin() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [servicosFirebase, setServicosFirebase] = useState([]);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [novoPreco, setNovoPreco] = useState("");

  const servicos = useMemo(
    () =>
      servicesConfig.map((servico) => {
        const salvo = servicosFirebase.find(
          (item) => normalizeText(item.nome) === normalizeText(servico.nome)
        );

        return {
          ...servico,
          id: salvo?.id,
          preco: salvo?.preco || servico.preco,
        };
      }),
    [servicosFirebase]
  );

  const datasOrdenadas = useMemo(
    () =>
      Object.keys(
        agendamentos.reduce((acc, item) => {
          const data = normalizeAppointmentDate(item.data);
          if (!acc[data]) acc[data] = [];
          acc[data].push(item);
          return acc;
        }, {})
      ).sort((a, b) => new Date(a) - new Date(b)),
    [agendamentos]
  );

  const agendamentosPorData = useMemo(
    () =>
      agendamentos.reduce((acc, item) => {
        const data = normalizeAppointmentDate(item.data);
        if (!acc[data]) acc[data] = [];
        acc[data].push(item);
        return acc;
      }, {}),
    [agendamentos]
  );

  useEffect(() => {
    const unsubAppointments = onSnapshot(collection(db, "appointments"), (snap) => {
      setAgendamentos(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    const unsubBloqueios = onSnapshot(collection(db, "bloqueios"), (snap) => {
      setBloqueios(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    const unsubServicos = onSnapshot(collection(db, "servicos"), (snap) => {
      setServicosFirebase(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    });

    return () => {
      unsubAppointments();
      unsubBloqueios();
      unsubServicos();
    };
  }, []);

  const formatarData = (data) => {
    if (!data) return "";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
  };

  const excluir = async (id) => {
    await deleteDoc(doc(db, "appointments", id));
  };

  const editarHorario = async (id) => {
    const novoHorario = prompt("Novo horário:");
    if (!novoHorario) return;

    await updateDoc(doc(db, "appointments", id), {
      hora: novoHorario,
    });
  };

  const bloquearPeriodo = async () => {
    if (!dataInicio || !dataFim) return;

    await addDoc(collection(db, "bloqueios"), {
      inicio: dataInicio,
      fim: dataFim,
    });

    setDataInicio("");
    setDataFim("");
  };

  const removerBloqueio = async (id) => {
    await deleteDoc(doc(db, "bloqueios", id));
  };

  const alterarPreco = async () => {
    if (!servicoSelecionado || !novoPreco) return;

    const servico = servicos.find((item) => item.nome === servicoSelecionado);
    if (!servico) return;

    if (servico.id) {
      await updateDoc(doc(db, "servicos", servico.id), {
        nome: servico.nome,
        preco: novoPreco,
      });
    } else {
      await addDoc(collection(db, "servicos"), {
        nome: servico.nome,
        preco: novoPreco,
      });
    }

    setNovoPreco("");
    setServicoSelecionado("");
  };

  return (
    <div className="pagina">
      <section className="servicos-container">
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "20px",
            color: "#fff",
            width: "100%",
            position: "relative",
            zIndex: 10,
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: "30px",
              background: "rgba(0, 0, 0, 0.65)",
              padding: "15px",
              borderRadius: "15px",
              backdropFilter: "blur(6px)",
            }}
          >
            Administração
          </h1>

          <h2
            style={{
              background: "rgba(0,0,0,0.6)",
              padding: "8px 12px",
              borderRadius: "10px",
              display: "inline-block",
            }}
          >
            Agendamentos
          </h2>

          {datasOrdenadas.length === 0 && (
            <p style={{ background: "rgba(0,0,0,0.6)", padding: "12px", borderRadius: "10px" }}>
              Nenhum agendamento encontrado.
            </p>
          )}

          {datasOrdenadas.map((data) => (
            <div key={data}>
              <h3
                style={{
                  background: "#ccc",
                  color: "#000",
                  padding: "10px",
                  borderRadius: "10px",
                  marginTop: "15px",
                }}
              >
                {formatarData(data)}
              </h3>

              {agendamentosPorData[data].map((agendamento) => (
                <div
                  key={agendamento.id}
                  style={{
                    background: "rgba(44, 26, 46, 0.95)",
                    padding: "20px",
                    borderRadius: "20px",
                    marginBottom: "10px",
                  }}
                >
                  <p>
                    <strong>{agendamento.servico}</strong>
                  </p>
                  <p>{agendamento.preco}</p>
                  <p>{agendamento.hora}</p>
                  <p>{agendamento.nome}</p>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                      onClick={() => editarHorario(agendamento.id)}
                      style={{
                        background: "#9333ea",
                        padding: "10px",
                        borderRadius: "10px",
                        color: "#fff",
                        flex: 1,
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluir(agendamento.id)}
                      style={{
                        background: "#ef4444",
                        padding: "10px",
                        borderRadius: "10px",
                        color: "#fff",
                        flex: 1,
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <h2
            style={{
              marginTop: "30px",
              background: "rgba(0,0,0,0.6)",
              padding: "8px 12px",
              borderRadius: "10px",
              display: "inline-block",
            }}
          >
            Bloquear período
          </h2>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "15px",
              background: "rgba(0,0,0,0.7)",
              padding: "15px",
              borderRadius: "15px",
            }}
          >
            <input
              type="date"
              value={dataInicio}
              onChange={(event) => setDataInicio(event.target.value)}
              style={{ padding: "12px", borderRadius: "10px", flex: 1 }}
            />
            <input
              type="date"
              value={dataFim}
              onChange={(event) => setDataFim(event.target.value)}
              style={{ padding: "12px", borderRadius: "10px", flex: 1 }}
            />

            <button
              onClick={bloquearPeriodo}
              style={{ background: "#facc15", padding: "12px", borderRadius: "10px" }}
            >
              Bloquear
            </button>
          </div>

          {bloqueios.map((bloqueio) => (
            <div
              key={bloqueio.id}
              style={{
                background: "rgba(60, 20, 60, 0.9)",
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "5px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {bloqueio.inicio} até {bloqueio.fim}
              </span>

              <button
                onClick={() => removerBloqueio(bloqueio.id)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "8px",
                }}
              >
                Remover
              </button>
            </div>
          ))}

          <h2
            style={{
              marginTop: "30px",
              background: "rgba(0,0,0,0.6)",
              padding: "8px 12px",
              borderRadius: "10px",
              display: "inline-block",
            }}
          >
            Alterar preços
          </h2>

          <div
            style={{
              background: "rgba(44, 26, 46, 0.95)",
              padding: "20px",
              borderRadius: "15px",
              marginTop: "10px",
            }}
          >
            <select
              value={servicoSelecionado}
              onChange={(event) => setServicoSelecionado(event.target.value)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                width: "100%",
                marginBottom: "10px",
              }}
            >
              <option value="">Selecione o serviço</option>
              {servicos.map((servico) => (
                <option key={servico.nome} value={servico.nome}>
                  {servico.nome} - {servico.preco}
                </option>
              ))}
            </select>

            <input
              placeholder="Novo preço"
              value={novoPreco}
              onChange={(event) => setNovoPreco(event.target.value)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                width: "100%",
                marginBottom: "10px",
              }}
            />

            <button
              onClick={alterarPreco}
              style={{
                background: "#22c55e",
                color: "#fff",
                padding: "12px",
                borderRadius: "10px",
                width: "100%",
              }}
            >
              Atualizar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
