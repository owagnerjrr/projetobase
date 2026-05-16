import { useState } from "react";
import { generateTimeSlots } from "../utils/generateTimeSlots";

export default function TimeSlots({ onSelect }) {
  const slots = generateTimeSlots();
  const [selected, setSelected] = useState(null);

  return (
    <div className="slots">
      {slots.map((time) => (
        <button
          key={time}
          className={selected === time ? "selected" : ""}
          onClick={() => {
            setSelected(time);
            onSelect(time);
          }}
        >
          {time}
        </button>
      ))}
    </div>
  );
}