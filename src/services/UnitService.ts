import { raw } from "objection";
import Unit, { IUnit } from "../model/Unit";

export async function byCode(code: number): Promise<Unit | undefined> {
  return await Unit.query().findById(code);
}

export async function current(op_code: number): Promise<Unit | undefined> {
  return await Unit.query().findOne(
    raw(`op_code = ${op_code} and CURRENT_DATE <= to_date`)
  );
}

export async function byOp(op_code: number): Promise<Unit[]> {
  return await Unit.query().where("op_code", op_code).orderBy("created_at", "DESC");
}

export async function store(unit: IUnit): Promise<Unit> {
  return await Unit.query().insert(unit).returning("*");
}

export async function update(unit: IUnit, code: number): Promise<number> {
  return await Unit.query()
    .update({ ...unit })
    .where("code", code);
}

export async function destroy(code: number): Promise<number> {
  return await Unit.query().deleteById(code);
}
