import dayjs from "dayjs";

export const formatDate = (dateString: string) => {
  const date = dayjs(dateString);
  const today = dayjs();

  if (date.isSame(today, "day")) return date.format("HH:mm");

  return date.format("MMM D, YYYY");
};
