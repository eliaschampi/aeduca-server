import { Model } from "objection";
import Person from "./Person";
import Profile from "./Profile";

class Register extends Model {
  section_code?: string | null;

  static tableName = "register";

  static get idColumn(): string {
    return "code";
  }

  static relationMappings = {
    person: {
      relation: Model.BelongsToOneRelation,
      modelClass: Person,
      join: {
        from: "register.student_dni",
        to: "person.dni"
      }
    },
    profile: {
      relation: Model.BelongsToOneRelation,
      modelClass: Profile,
      join: {
        from: "register.student_dni",
        to: "profile.person_dni"
      }
    }
  };
}

export default Register;
