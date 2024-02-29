import { Model } from "objection";
import Person from "./Person";
import Profile from "./Profile";
import Score from "./Score";

class Register extends Model {
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
    },
    score: {
      relation: Model.HasManyRelation,
      modelClass: Score,
      join: {
        from: "register.code",
        to: "score.register_code"
      }
    }
  };
}

export default Register;
