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

async function populateDni() {
  // Aeduca DB connection
  const aeducaKnex: Knex = knexConstructor({
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  });

  // Nextya DB connection
  const nextyaKnex: Knex = knexConstructor({
    client: "pg",
    connection: {
      host: process.env.NEXTYA_DB_HOST,
      port: Number(process.env.NEXTYA_DB_PORT || 5432),
      database: process.env.NEXTYA_DB_NAME,
      user: process.env.NEXTYA_DB_USER,
      password: process.env.NEXTYA_DB_PASSWORD
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

      if (matches.length === 1) {
        // Unique match, update DNI
        await nextyaKnex("students")
          .where("code", student.code)
          .update({ dni: matches[0].dni });
        console.log(
          `Updated student ${student.name} ${student.last_name} with DNI ${matches[0].dni}`
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
