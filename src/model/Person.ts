import { Model } from "objection";
import Profile from "./Profile";

export type personSingle = {
  dni: string;
  full_name: string;
  image: string;
  is_creator?: boolean;
  is_admin?: boolean;
};

class Person extends Model {
  static get tableName(): string {
    return "person";
  }

  static get idColumn(): string {
    return "dni";
  }

  static get relationMappings(): any {
    return {
      profile: {
        relation: Model.HasOneRelation,
        modelClass: Profile,
        join: {
          from: "person.dni",
          to: "profile.person_dni"
        }
      }
    };
  }
}

export default Person;
