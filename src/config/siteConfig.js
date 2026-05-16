import logo from "../assets/logo-placeholder.svg";
import professionalPhoto from "../assets/profissional-placeholder.svg";

export const siteConfig = {
  brandName: "Espaco do Cliente",
  heroTitle: ["ESPACO DO", "CLIENTE"],
  subtitle: "Beleza, cuidado e bem-estar",

  assets: {
    logo,
    professionalPhoto,
    professionalAlt: "Foto profissional",
  },

  contact: {
    whatsappNumber: "5500000000000",
    email: "contato@cliente.com",
    instagramUrl: "https://www.instagram.com/seucliente",
    mapsUrl: "https://www.google.com/maps",
  },

  address: [
    "Rua do Cliente, No 000",
    "Complemento / sala",
    "Bairro",
    "Cidade - UF",
  ],

  paymentMethods: [
    "Cartoes de credito e debito",
    "Pix",
    "Dinheiro",
  ],

  routes: {
    publicAlias: "/cliente",
    admin: "/admin-agenda",
    appointments: "/minhas-marcacoes",
  },

  schedule: {
    openingHour: 9,
    weekdayClosingHour: 18,
    saturdayClosingHour: 12,
    closedWeekdays: [0],
    minimumHoursNotice: 2,
    maxAppointmentsPerDay: 5,
  },
};
