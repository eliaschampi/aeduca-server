import { types } from "pg";
import { iso } from "./date";

export default function (): void {
  const DATE_OID = 1082;
  const parseDate = (value: string) => iso(new Date(value));
  types.setTypeParser(DATE_OID, parseDate);
}
