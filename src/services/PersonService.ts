import { QueryBuilder, raw, ref } from "objection";
import Person from "../model/Person";
import Register from "../model/Register";

export const fetchByDNI = (dni: string): QueryBuilder<Person, Person | undefined> => {
  return Person.query()
    .select([
      "dni",
      "name",
      "lastname",
      "birthdate",
      "ubigeo",
      "district",
      "address",
      "phone",
      "email",
      "obs"
    ])
    .withGraphFetched("[profile(only)]")
    .modifiers({
      only(builder) {
        builder.select("image", "password", "description", "last_logout");
      }
    })
    .findById(dni);
};

export const fetchPersonsByDNIS = (dnis: string): QueryBuilder<Person, Person[]> => {
  return Person.query()
    .select(["dni", "name", "lastname"])
    .withGraphFetched("[profile(only)]")
    .modifiers({
      only(builder) {
        builder.select("image", "description");
      }
    })
    .whereIn("dni", dnis.split("_"));
};

export const fetchByUniqueAttrs = (
  email: string,
  dni: string
): QueryBuilder<Person, Person | undefined> => {
  return Person.query().findOne({
    email,
    dni
  });
};

export const fetchByEmail = (email: string): QueryBuilder<Person, Person | undefined> => {
  return Person.query().findOne({
    email
  });
};

export const finderQuery = (query: string): QueryBuilder<Person, Person[]> => {
  return Person.query()
    .select([
      "dni",
      "name",
      "lastname",
      "profile.image",
      Register.query()
        .select("section_code")
        .where("student_dni", ref("person.dni"))
        .where("section_code", "like", "2022%")
        .limit(1)
        .as("section_code")
    ])
    .where(raw(`name || ' ' || lastname ILIKE '%${query}%'`))
    .innerJoinRelated("profile")
    .limit(10);
};

export const updateEmail = (dni: string, email: string): QueryBuilder<Person, number> => {
  return Person.query().findById(dni).patch({
    email
  });
};
