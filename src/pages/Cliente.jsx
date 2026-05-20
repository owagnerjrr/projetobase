import "./cliente.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, addDoc, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { siteConfig } from "../config/siteConfig";
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
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return value.split("T")[0];
};

const formatDateBR = (value) => {
  const normalizedDate = normalizeAppointmentDate(value);
  if (!normalizedDate) return "";

  const [year, month, day] = normalizedDate.split("-");
  return `${day}/${month}/${year}`;
};

const localToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

export default function Cliente() {
  const [servicos, setServicos] = useState(servicesConfig);
  const [bloqueios, setBloqueios] = useState([]);
  const [pausas, setPausas] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  const [descricaoAberta, setDescricaoAberta] = useState(null);
  const [modalAgenda, setModalAgenda] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  const [step, setStep] = useState("data");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [nome, setNome] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");

  const gerarHorarios = useCallback((data) => {
    const {
      openingHour,
      weekdayClosingHour,
      saturdayClosingHour,
      closedWeekdays,
      minimumHoursNotice,
      maxAppointmentsPerDay,
    } = siteConfig.schedule;

    const dataAtual = new Date(`${data}T12:00:00`);
    const bloqueado = bloqueios.find((bloqueio) => {
      const inicio = new Date(`${normalizeAppointmentDate(bloqueio.inicio)}T12:00:00`);
      const fim = new Date(`${normalizeAppointmentDate(bloqueio.fim)}T12:00:00`);
      return dataAtual >= inicio && dataAtual <= fim;
    });

    if (bloqueado) return [];

    const dia = new Date(`${data}T00:00:00`).getDay();
    if (closedWeekdays.includes(dia)) return [];

    const fim = dia === 6 ? saturdayClosingHour : weekdayClosingHour;
    const agora = new Date();
    const hoje = localToday();
    const limite = agora.getHours() + minimumHoursNotice;

    const totalNoDia = agendamentos.filter(
      (agendamento) => normalizeAppointmentDate(agendamento.data) === data
    );

    if (totalNoDia.length >= maxAppointmentsPerDay) return [];

    const lista = [];

    for (let hora = openingHour; hora < fim; hora += 1) {
      if (data === hoje && hora < limite) continue;

      const horaFormatada = `${hora.toString().padStart(2, "0")}:00`;
      const horaEmPausa = pausas.some((pausa) => {
        if (
          normalizeAppointmentDate(pausa.data) !== data ||
          !pausa.inicio ||
          !pausa.fim
        ) {
          return false;
        }

        const horaMinutos = timeToMinutes(horaFormatada);
        return horaMinutos >= timeToMinutes(pausa.inicio) &&
          horaMinutos < timeToMinutes(pausa.fim);
      });

      if (horaEmPausa) continue;

      const jaAgendado = agendamentos.find(
        (agendamento) =>
          normalizeAppointmentDate(agendamento.data) === data &&
          agendamento.hora === horaFormatada
      );

      if (!jaAgendado) lista.push(horaFormatada);
    }

    return lista;
  }, [agendamentos, bloqueios, pausas]);

  const horariosDisponiveis = useMemo(() => {
    if (!dataSelecionada) return [];
    return gerarHorarios(dataSelecionada);
  }, [dataSelecionada, gerarHorarios]);

  const mensagemSemHorarios = useMemo(() => {
    if (!dataSelecionada) return "Não há horários disponíveis neste dia";

    const dataAtual = new Date(`${dataSelecionada}T12:00:00`);
    const dataBloqueada = bloqueios.some((bloqueio) => {
      const inicio = new Date(`${normalizeAppointmentDate(bloqueio.inicio)}T12:00:00`);
      const fim = new Date(`${normalizeAppointmentDate(bloqueio.fim)}T12:00:00`);
      return dataAtual >= inicio && dataAtual <= fim;
    });
    const dia = new Date(`${dataSelecionada}T00:00:00`).getDay();
    const totalNoDia = agendamentos.filter(
      (agendamento) => normalizeAppointmentDate(agendamento.data) === dataSelecionada
    ).length;
    const temPausaNoDia = pausas.some(
      (pausa) => normalizeAppointmentDate(pausa.data) === dataSelecionada
    );

    if (dataBloqueada || siteConfig.schedule.closedWeekdays.includes(dia)) {
      return "Não atenderemos neste dia";
    }

    if (totalNoDia >= siteConfig.schedule.maxAppointmentsPerDay) {
      return "Agenda cheia neste dia";
    }

    if (temPausaNoDia) {
      return "Horário de pausa ou almoço neste dia";
    }

    return "Não há horários disponíveis neste dia";
  }, [agendamentos, bloqueios, dataSelecionada, pausas]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "servicos"), (snapshot) => {
      const dadosFirebase = snapshot.docs.map((doc) => doc.data());

      const listaFinal = servicesConfig.map((servico) => {
        const encontrado = dadosFirebase.find(
          (item) => normalizeText(item.nome) === normalizeText(servico.nome)
        );

        return {
          ...servico,
          preco: encontrado ? encontrado.preco : servico.preco,
        };
      });

      setServicos(listaFinal);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "bloqueios"), (snapshot) => {
      setBloqueios(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pausas"), (snapshot) => {
      setPausas(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "appointments"), (snapshot) => {
      setAgendamentos(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, []);

  const salvarAgendamento = async () => {
    const snapshot = await getDocs(collection(db, "appointments"));
    const lista = snapshot.docs.map((doc) => doc.data());

    const jaExiste = lista.find(
      (agendamento) =>
        normalizeAppointmentDate(agendamento.data) === dataSelecionada &&
        agendamento.hora === horarioSelecionado
    );

    if (jaExiste) {
      alert("Esse horário já foi reservado. Escolha outro.");
      return false;
    }

    const totalNoDia = lista.filter(
      (agendamento) => normalizeAppointmentDate(agendamento.data) === dataSelecionada
    );

    if (totalNoDia.length >= siteConfig.schedule.maxAppointmentsPerDay) {
      alert("Limite de atendimentos atingido para este dia.");
      return false;
    }

    await addDoc(collection(db, "appointments"), {
      nome,
      telefone: telefoneCliente,
      servico: servicoSelecionado.nome,
      preco: servicoSelecionado.preco,
      data: formatDateBR(dataSelecionada),
      hora: horarioSelecionado,
      criadoEm: new Date(),
    });

    return true;
  };

  const abrirAgenda = (servico) => {
    setServicoSelecionado(servico);
    setModalAgenda(true);
    setStep("data");
    setDataSelecionada("");
    setNome("");
    setTelefoneCliente("");
    setHorarioSelecionado("");
  };

  const confirmarWhatsapp = async () => {
    const sucesso = await salvarAgendamento();
    if (!sucesso) return;

    const mensagem = `Olá, me chamo ${nome}
Telefone: ${telefoneCliente}
Serviço: ${servicoSelecionado.nome}
Valor: ${servicoSelecionado.preco}
Data: ${formatDateBR(dataSelecionada)}
Horário: ${horarioSelecionado}

Estou ciente que o agendamento será confirmado após pagamento de 50%.`;

    const msg = encodeURIComponent(mensagem);
    window.location.href = `https://api.whatsapp.com/send?phone=${siteConfig.contact.whatsappNumber}&text=${msg}`;
  };

  return (
    <div className="pagina">
      <section className="hero">
        <div className="hero-esquerda">
          <h1>
            {siteConfig.heroTitle.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </h1>
          <p className="subtitulo">{siteConfig.subtitle}</p>
        </div>

        <div className="hero-centro">
          <img src={siteConfig.assets.logo} alt="Logo" className="logo-grande" />
        </div>

        <div className="hero-direita">
          <img
            src={siteConfig.assets.professionalPhoto}
            alt={siteConfig.assets.professionalAlt}
            className="foto-profissional"
          />
        </div>
      </section>

      <section className="servicos-container">
        <div className="servicos">
          {servicos.map((servico, index) => (
            <div key={servico.nome} className="bloco">
              <h3>{servico.nome}:</h3>
              <p>{servico.preco}</p>
              {servico.img && (
                <img src={servico.img} alt={servico.nome} className="img-servico" />
              )}

              <div className="botoes-servico">
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    abrirAgenda(servico);
                  }}
                  className="btn-agendar-servico"
                >
                  Agenda
                </a>

                <button className="btn-descricao" onClick={() => setDescricaoAberta(index)}>
                  Descrição
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {descricaoAberta !== null && (
        <div className="modal-overlay" onClick={() => setDescricaoAberta(null)}>
          <div className="modal-conteudo" onClick={(event) => event.stopPropagation()}>
            <img
              src={servicos[descricaoAberta].desc}
              alt={servicos[descricaoAberta].nome}
              className="modal-img"
            />
            <button className="modal-fechar" onClick={() => setDescricaoAberta(null)}>
              x
            </button>
          </div>
        </div>
      )}

      {modalAgenda && (
        <div className="modal-overlay" onClick={() => setModalAgenda(false)}>
          <div
            className="modal-conteudo"
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #2c1a2e, #4b2c52)",
              color: "#fff",
              borderRadius: "20px",
              padding: "25px",
              maxWidth: "350px",
              width: "90%",
              boxShadow: "0 0 25px rgba(0,0,0,0.6)",
            }}
          >
            <h3 style={{ textAlign: "center" }}>{servicoSelecionado?.nome}</h3>

            {step === "data" && (
              <div style={{ textAlign: "center" }}>
                <h2>Escolha uma data</h2>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <button
                    onClick={() => {
                      window.location.href = siteConfig.routes.appointments;
                    }}
                    style={{
                      background: "#9b59b6",
                      color: "#fff",
                      padding: "12px 30px",
                      borderRadius: "30px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "15px",
                      boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
                      width: "220px",
                    }}
                  >
                    Meus agendamentos
                  </button>
                </div>

                <input
                  type="date"
                  min={localToday()}
                  value={dataSelecionada}
                  onChange={(event) => {
                    setDataSelecionada(event.target.value);
                    setHorarioSelecionado("");
                  }}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    width: "100%",
                    margin: "10px 0",
                  }}
                />

                <button
                  onClick={() => setStep("horario")}
                  disabled={!dataSelecionada}
                  style={{
                    background: "#a855f7",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "10px",
                    width: "100%",
                  }}
                >
                  Continuar
                </button>
              </div>
            )}

            {step === "horario" && (
              <div style={{ textAlign: "center" }}>
                {horariosDisponiveis.length === 0 ? (
                  <p>{mensagemSemHorarios}</p>
                ) : (
                  <>
                    <p>Escolha um horário:</p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: "8px",
                      }}
                    >
                      {!horarioSelecionado &&
                        horariosDisponiveis.map((horario) => (
                          <button
                            key={horario}
                            style={{
                              padding: "10px",
                              borderRadius: "10px",
                              background: "#9333ea",
                              color: "#fff",
                            }}
                            onClick={() => setHorarioSelecionado(horario)}
                          >
                            {horario}
                          </button>
                        ))}
                    </div>

                    {horarioSelecionado && (
                      <div style={{ marginTop: "15px" }}>
                        <input
                          placeholder="Nome completo"
                          value={nome}
                          onChange={(event) => setNome(event.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "10px",
                            marginBottom: "10px",
                          }}
                        />

                        <input
                          placeholder="Telefone"
                          value={telefoneCliente}
                          onChange={(event) => setTelefoneCliente(event.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "10px",
                            marginBottom: "10px",
                          }}
                        />

                        <button
                          disabled={!nome || !telefoneCliente}
                          onClick={confirmarWhatsapp}
                          style={{
                            background: "#22c55e",
                            color: "#fff",
                            padding: "10px",
                            borderRadius: "10px",
                            width: "100%",
                            fontWeight: "bold",
                          }}
                        >
                          Confirmar e ir para WhatsApp
                        </button>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={() => setStep("data")}
                  style={{
                    marginTop: "10px",
                    background: "#444",
                    color: "#fff",
                    padding: "8px",
                    borderRadius: "10px",
                    width: "100%",
                  }}
                >
                  Voltar
                </button>
              </div>
            )}

            <button className="modal-fechar" onClick={() => setModalAgenda(false)}>
              x
            </button>
          </div>
        </div>
      )}

      <section className="infos">
        <div className="coluna">
          <div className="coluna-esquerda">
            <h3>NOSSO ESPAÇO:</h3>

            <div className="icones">
              <a
                href={siteConfig.contact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="icone-mapa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="#e74c3c" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z" />
                </svg>
              </a>

              <a href={`mailto:${siteConfig.contact.email}`} className="icone-email">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="#9b59b6" viewBox="0 0 24 24">
                  <path d="M2 4h20v16H2V4zm10 7L3 6v12h18V6l-9 5z" />
                </svg>
              </a>

              <a
                href={siteConfig.contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="icone-instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#E1306C">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zm9.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                </svg>
              </a>
            </div>

            <div className="endereco-box">
              {siteConfig.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="coluna-direita">
            <h3>FORMAS DE PAGAMENTO:</h3>
            <ul>
              {siteConfig.paymentMethods.map((method) => (
                <li key={method}>{method}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="coluna atendimento"></div>
      </section>
    </div>
  );
}
