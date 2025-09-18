// PostDecorator - Legacy decorator for post display (may need refactoring)
type IPostDecorated = {
  code?: number;
  content: string;
  link?: string;
  likes?: string[];
  savelist?: string[];
  files?: Array<{
    type: string;
    full_route?: string;
  }>;
  comment_count?: number;
  comment?: any;
};

//eslint-disable-next-line
export function decoratePosts(posts: IPostDecorated[], dni: string) {
  return posts.map((item) => {
    let video = null;
    let img = null;
    let liked = false;
    let saved = false;
    let likes: string[] = [];
    let comments: any = [];

    if (item.files) {
      let index = -1;
      for (let i = 0; i < item.files.length; i++) {
        const file = item.files[i];

        if (file.type === "vid") {
          video = file.full_route;
          index = i;
          break;
        } else if (file.type === "img") {
          img = file.full_route;
          index = i;
          break;
        }
      }
      if (img || video) {
        item.files.splice(index, 1);
      }
    }

    const c =
      /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/; //eslint-disable-line
    const splited = c.exec(<string>item.link);

    if (item.likes) {
      liked = item.likes.some((l: string) => l === dni);
      likes = item.likes;
    }

    if (item.comment_count) {
      comments = [item.comment];
      delete item.comment;
    }

    if (item.savelist) {
      console.log(item);

      saved = item.savelist.some((s: string) => s === dni);
      delete item.savelist;
    }

    return {
      ...item,
      liked,
      likes,
      saved,
      isview: false,
      video,
      img,
      hasimage: img !== null,
      videosrc: null,
      imgsrc: null,
      videoid: !splited ? false : splited[1],
      comments
    };
  });
}
