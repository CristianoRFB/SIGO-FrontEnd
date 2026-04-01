import { ReactNode } from "react";

type Column<T> = {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (item: T) => ReactNode;
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  getRowId?: (item: T) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  emptyMessage = "Nenhum registro encontrado",
  getRowId,
}: DataTableProps<T>) {
  function resolveRowKey(item: T, index: number) {
    const rowId = getRowId?.(item);
    return rowId === undefined || rowId === null || rowId === ""
      ? `row-${index}`
      : `row-${String(rowId)}-${index}`;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{ width: column.width }}
                className={column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-slate-400" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={resolveRowKey(item, index)}>
                {columns.map((column) => {
                  const content = column.render ? column.render(item) : (item as Record<string, unknown>)[column.key as string];
                  return (
                    <td
                      key={String(column.key)}
                      className={column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""}
                    >
                      {content as ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
