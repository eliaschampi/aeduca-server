import Teacher from "../model/Teacher";

export const fetchActiveTeacher = async (dni: string): Promise<Teacher | null> => {
  const teacher = await Teacher.query().where("dni", dni).where("state", true).first();

  if (teacher) {
    return teacher;
  }
  return null;
};
