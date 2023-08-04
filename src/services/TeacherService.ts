import Teacher from "../model/Teacher";

export const fetchActiveTeacher = async (dni: string): Promise<Teacher | null> => {
  const values = await Teacher.query().where("dni", dni).where("state", true);

  if (values.length) {
    return values[0];
  }
  return null;
};
