/* eslint-disable */
import knexConstructor, { Knex } from "knex";

type NextyaStudent = {
  code: string;
  name: string;
  last_name: string;
  dni?: string;
};

type AeducaPerson = {
  dni: string;
  name: string;
  lastname: string;
};

const HOST = process.env.DB_HOST ?? "localhost";
const PORT = Number(process.env.DB_PORT ?? 5432);
const DATABASE = process.env.DB_NAME ?? "aeduca";
const USER = process.env.DB_USER ?? "aeduca";
const PASSWORD = process.env.DB_PASSWORD ?? "aeduca";

const NEXTYA_HOST = process.env.NEXTYA_DB_HOST ?? "localhost";
const NEXTYA_PORT = Number(process.env.NEXTYA_DB_PORT ?? 5432);
const NEXTYA_DATABASE = process.env.NEXTYA_DB_NAME ?? "nextya";
const NEXTYA_USER = process.env.NEXTYA_DB_USER ?? "nextya";
const NEXTYA_PASSWORD = process.env.NEXTYA_DB_PASSWORD ?? "nextya";

async function populateDni() {
  // Aeduca DB connection
  const aeducaKnex: Knex = knexConstructor({
    client: "pg",
    connection: {
      host: HOST,
      port: PORT,
      database: DATABASE,
      user: USER,
      password: PASSWORD
    }
  });

  // Nextya DB connection
  const nextyaKnex: Knex = knexConstructor({
    client: "pg",
    connection: {
      host: NEXTYA_HOST,
      port: NEXTYA_PORT,
      database: NEXTYA_DATABASE,
      user: NEXTYA_USER,
      password: NEXTYA_PASSWORD
    }
  });

  try {
    // Get Nextya students where dni is null
    const nextyaStudents: NextyaStudent[] = await nextyaKnex("students")
      .select("code", "name", "last_name")
      .whereNull("dni");

    console.log(`Found ${nextyaStudents.length} students in Nextya without DNI`);

    for (const student of nextyaStudents) {
      // Find matching persons in Aeduca
      const matches: AeducaPerson[] = await aeducaKnex("person")
        .select("dni", "name", "lastname")
        .where("name", student.name)
        .andWhere("lastname", student.last_name);

      const [match] = matches;

      if (matches.length === 1 && match) {
        // Unique match, update DNI
        await nextyaKnex("students")
          .where("code", student.code)
          .update({ dni: match.dni });
        console.log(
          `Updated student ${student.name} ${student.last_name} with DNI ${match.dni}`
        );
      } else if (matches.length === 0) {
        console.log(`No match found for student ${student.name} ${student.last_name}`);
      } else {
        console.log(
          `Multiple matches found for student ${student.name} ${student.last_name}: ${matches.map((m) => m.dni).join(", ")}`
        );
      }
    }

    console.log("DNI population completed");
  } catch (error) {
    console.error("Error populating DNI:", error);
  } finally {
    await aeducaKnex.destroy();
    await nextyaKnex.destroy();
  }
}

// Run the script
populateDni();
