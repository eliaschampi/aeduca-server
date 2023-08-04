import { personSingle } from "../model/Person";
import { IRoomDecoratored } from "../model/Room";
//eslint-disable-next-line
export function decorateRooms(rooms: IRoomDecoratored[], dni: string) {
  return rooms.map((item) => {
    let message = "";
    let has_news = false;
    let subtitle = `${item.message_count} mensajes`;

    let friend: personSingle = {
      dni: "",
      full_name: "Conversación eliminada",
      image: "deleted.png"
    };

    if (item.persons.length > 0) {
      if (item.is_group) {
        friend.full_name = <string>item.name;
        friend.image = "group.png";
        subtitle = `Grupo con ${item.persons.length} miembros`;
      } else {
        const person = item.persons.find((p) => p.dni !== dni);
        if (person) {
          friend = <personSingle>person;
        }
      }
    }

    if (item.message) {
      message = item.message.message;

      if (item.message.content_type !== "k") {
        has_news = item.message.from.dni !== dni && !item.message.is_readed;
      }
    }

    delete item.name;

    return {
      ...item,
      friend,
      subtitle,
      online: false,
      typing: false,
      message,
      has_news
    };
  });
}
