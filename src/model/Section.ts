import { Model } from "objection";

class Section extends Model {
  static get tableName(): string {
    return "section";
  }

  static get idColumn(): string {
    return "code";
  }
}

export default Section;
