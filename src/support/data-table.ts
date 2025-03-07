import { substituteValue } from './substitution';

export interface DataTable {
  rawTable: [string[], string[]];
}

export const dataTableToObject = <T>(dataTable: DataTable): T => {
  const data = dataTable.rawTable;
  const obj: Record<string, unknown> = {};

  data[0].forEach((key, index) => {
    const val = data[1][index];
    if (val === 'MISSING') {
      obj[key] = null;
    } else {
      obj[key] = substituteValue(val);
    }
  });

  return obj as T;
};

export const dataTableToObjectArray = <T>(dataTable: DataTable): T[] => {
  const data = dataTable.rawTable;

  const objArray: T[] = [];
  const keys = data[0];
  const items = data.slice(1);

  items.forEach((item) => {
    const obj: Record<string, unknown> = {};
    keys.forEach((key, keyIndex) => {
      const val = item[keyIndex];
      if (val === 'MISSING') {
        obj[key] = null;
      } else {
        let valToSub = val;
        // to be able to maintain whitespace in data table strings, such as "  T{{seq}}608  "
        if (val.startsWith('"') && val.endsWith('"')) {
          valToSub = valToSub.split('"').join('');
        }
        obj[key] = substituteValue(valToSub);
      }
    });
    objArray.push(obj as T);
  });

  return objArray;
};
