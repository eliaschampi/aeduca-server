export const iso = (today = new Date()): string => {
  const mm = (today.getMonth() + 1).toString().padStart(2, "0");
  const dd = today.getDate().toString().padStart(2, "0");
  return [today.getFullYear(), mm, dd].join("-");
};
