import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function criarAgendamento(data) {
  try {
    const docRef = await addDoc(collection(db, "appointments"), {
      ...data,
      status: "pending",
      createdAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    throw error;
  }
}
