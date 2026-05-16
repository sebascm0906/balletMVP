const SPANISH_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function calculateAge(birthDate: string | Date, referenceDate = new Date()) {
  const birth = new Date(birthDate);
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDifference = referenceDate.getMonth() - birth.getMonth();
  const isBeforeBirthday =
    monthDifference < 0 ||
    (monthDifference === 0 && referenceDate.getDate() < birth.getDate());

  if (isBeforeBirthday) {
    age -= 1;
  }

  return age;
}

export function getSpanishMonthName(month: number) {
  const monthName = SPANISH_MONTHS[month - 1];

  if (!monthName) {
    throw new Error("Mes inválido");
  }

  return monthName;
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}
