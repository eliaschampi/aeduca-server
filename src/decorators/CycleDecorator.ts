import { stsDecorated } from "./Decorators";

export const opsDecorated = (opvalues: any[]): any[] => {
  return opvalues.map((item) => {
    item["stext"] = stsDecorated(item.sts);
    return item;
  });
};

export const shsDecorated = (schedules: any[]): any[] => {
  return schedules.map((item) => {
    item["stext"] = stsDecorated(item.op.sts);
    return item;
  });
};
