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
      obj[key] = val;
    }
  });
  return obj as T;
};
