import { knex } from "../con/KnexConection";

const ATTENDANCE_TABLE_NAME = "attendance";
const INSPECTION_TABLE_NAME = "inspection";
const CYCLE_TABLE_NAME = "cycle";

export async function entryTime(cycle_code: string): Promise<any[]> {
  return await knex
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
}): Promise<any> {
  const returning_values = await knex("attendance")
    .insert(attendance_request)
    .returning("*");
  if (returning_values.length) {
    return returning_values[0];
  }
}

export async function sendPermise(permision_data: {
  description: string;
  branch_code: number;
}): Promise<number[]> {
  return await knex(INSPECTION_TABLE_NAME).insert({
    state: "p",
    inspection_type: "p",
    ...permision_data
  });
}
