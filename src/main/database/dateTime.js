function parseLocalDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateString ?? ""));
  if (!match) return null;

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return null;
  }
  return date;
}

function localDayStartUtc(dateString) {
  const date = parseLocalDate(dateString);
  if (!date) return null;
  return date.toISOString();
}

function localDayAfterUtc(dateString) {
  const date = parseLocalDate(dateString);
  if (!date) return null;
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

function localDateString(value = new Date()) {
  const date = value instanceof Date ? value : parseUtcTimestamp(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseUtcTimestamp(value) {
  if (value instanceof Date) return value;
  const text = String(value ?? "");
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(text)) {
    return new Date(`${text.replace(" ", "T")}Z`);
  }
  if (
    /^\d{4}-\d{2}-\d{2}T.*$/.test(text) &&
    !/(Z|[+-]\d{2}:?\d{2})$/i.test(text)
  ) {
    return new Date(`${text}Z`);
  }
  return new Date(text);
}

module.exports = {
  localDayStartUtc,
  localDayAfterUtc,
  localDateString,
  parseUtcTimestamp,
};