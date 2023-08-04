import { Model } from "objection";

class Profile extends Model {
  static get tableName(): string {
    return "profile";
  }

  static get idColumn(): string {
    return "person_dni";
  }
}

export type IProfile = {
  password?: string;
  image?: string;
  last_logout?: Date;
  description?: string;
};

export default Profile;
