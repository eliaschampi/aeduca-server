import Unit from "../model/Unit";
//eslint-disable-next-line
export function decorateUnit(units: Unit[]) {
  return units.map((item) => {
    return {
      ...item,
      lessons: []
    };
  });
}
