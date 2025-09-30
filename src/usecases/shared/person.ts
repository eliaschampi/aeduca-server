import Person from "../../model/Person";

export type PersonSummary = {
  name: string;
  lastname: string;
  image?: string | null;
};

export async function fetchPersonSummary(dni: string): Promise<PersonSummary> {
  const person = await Person.query()
    .select("person.name", "person.lastname")
    .select("profile.image as image")
    .leftJoin("profile", "person.dni", "profile.person_dni")
    .where("person.dni", dni)
    .first();

  if (!person) {
    throw new Error("Persona no encontrada");
  }

  return {
    name: person.name ?? "",
    lastname: person.lastname ?? "",
    image: person.image ?? null
  };
}
