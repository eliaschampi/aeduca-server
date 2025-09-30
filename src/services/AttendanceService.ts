import { knex } from "../con/KnexConection";

const ATTENDANCE_TABLE_NAME = "attendance";
const INSPECTION_TABLE_NAME = "inspection";
const CYCLE_TABLE_NAME = "cycle";

export function entryTime(cycle_code: string) {
  return knex
    .select(ATTENDANCE_TABLE_NAME)
    .from(CYCLE_TABLE_NAME)
    .where("code", cycle_code);
}

export async function existsToday(
  entity_identifier: string,
  entity_type: string
): Promise<boolean> {
  const values = await knex
    .select("*")
    .from(ATTENDANCE_TABLE_NAME)
    .where("entity_identifier", entity_identifier)
    .where("entity_type", entity_type)
    .whereRaw("CAST(created_at AS date) = CURRENT_DATE");
  return values.length > 0;
}

export async function justificate(
  a_code: number,
  description: string,
  attached: string | null
): Promise<boolean> {
  await knex(ATTENDANCE_TABLE_NAME).where("code", a_code).update({
    state: "envió justificación"
  });

  await knex("justification").insert({
    attendance_code: a_code,
    description,
    attached
  });

  return true;
}

export async function store(attendance_request: {
  state: string;
  branch_code: number;
  entry_time: string;
}){
  const returning_values = await knex("attendance")
    .insert(attendance_request)
    .returning("*");
  if (returning_values.length) {
    return returning_values[0];
  }
}

export function fetchByEntity(
  entity_identifier: string,
  from: string,
  to: string,
  priority: number
) {
  return knex
    .select("attendance.*", "justification.*")
    .from(ATTENDANCE_TABLE_NAME)
    .leftJoin("justification", "attendance.code", "justification.attendance_code")
    .whereBetween("attendance.created_at", [from, to])
    .where("attendance.priority", priority)
    .where("attendance.entity_identifier", entity_identifier)
    .orderBy("attendance.created_at", "desc");
}

export function sendPermise(permision_data: {
  description: string;
  branch_code: number;
}) {
  return knex(INSPECTION_TABLE_NAME).insert({
    state: "p",
    inspection_type: "p",
    ...permision_data
  });
}
