import { Model } from "objection";
import Register from "./Register";

class Payment extends Model {
  static tableName = "payment";

  static get idColumn(): string {
    return "code";
  }

  static relationMappings = {
    register: {
      relation: Model.BelongsToOneRelation,
      modelClass: Register,
      join: {
        from: "payment.register_code",
        to: "register.code"
      }
    }
  };
}

export default Payment;