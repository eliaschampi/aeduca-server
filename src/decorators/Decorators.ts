export const cycles: any = {
  PR: "Primaria",
  SE: "Secundaria",
  GE: "Quinto Excelencia",
  GC: "Grupo Carrión",
  DR: "Dirimencia",
  OP: "Primera Opción",
  OR: "Ordinario",
  TC: "Taller/Curso",
  EB: "Especializacion/Bootcamp"
};

export const full = (sc: string): string => {
  return `${sc.substring(8, 10)} de ${cycles[sc.substring(4, 6)]}`;
};

export const stsDecorated = (sts: string[]): string => {
  if (sts.length > 0) {
    let stext = "";
    const _s = sts[0];
    stext = _s.length === 10 ? full(_s) : cycles[_s] || "General";
    if (sts.length > 1) {
      return `${stext} y otros`;
    }
    return stext;
  }
  return "General";
};

export const sectionDeco = (sdata: any[]) => {
  return sdata.map((item) => {
    item["stext"] = full(item.code);
    return item;
  });
};
