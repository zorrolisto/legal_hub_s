import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface HasId {
  id: string | number;
}

export default function TableX<T extends HasId>({
  columns,
  data,
  actions,
}: any) {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns
              .filter((c: any) => !c.hiddenFromTable)
              .sort((a: any, b: any) => (a.order || 999) - (b.order || 999))
              .map((c: any, idx: number) => (
                <TableHead
                  key={idx}
                  scope="col"
                  className={
                    "whitespace-nowrap text-xs " + (idx === 0 ? "sm:px-0" : "")
                  }
                >
                  {c.getLabel ? c.getLabel() : c.label}
                </TableHead>
              ))}
            <TableHead scope="col" className="relative sm:pr-0"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((each: T) => (
            <TableRow key={"tr_" + each.id}>
              {columns
                .filter((c: any) => !c.hiddenFromTable)
                .sort((a: any, b: any) => (a.order || 999) - (b.order || 999))
                .map((c: any, idx: number) => (
                  <TableCell
                    key={"td_" + idx}
                    className={"text-xs " + (idx === 0 ? "sm:pl-0" : "")}
                    style={{
                      background:
                        c.type === "color" ? (each as any)[c.name] : "",
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      {c.table && c.table.preRender && c.table.preRender(each)}
                      <span className="text-xs">
                        {c?.table?.getValue ? (
                          c.table.getValue(each)
                        ) : (
                          <>
                            {c.type === "date"
                              ? (each as any)[c.name]
                                ? format((each as any)[c.name], "dd/MM/yyyy")
                                : "-"
                              : c.optionsMap || (each as any)[c.name]
                                ? (each as any)[c.name]
                                : "-"}
                          </>
                        )}
                      </span>
                    </div>
                  </TableCell>
                ))}
              <td className="relative sm:pr-0">{actions(each)}</td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
