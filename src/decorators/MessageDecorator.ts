import { IMessage } from "../model/Message";

//eslint-disable-next-line
export function decorateMessages(rooms: IMessage[]) {
  return rooms.map((item) => {
    return {
      ...item,
      currentTime: item.content_type === "a" ? 0 : null,
      audioUrl: null,
      loading: false,
      error: false
    };
  });
}
