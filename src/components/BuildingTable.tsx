import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { BuildingRow } from '@/types/database.types'

type Props = {
  buildings: BuildingRow[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function BuildingTable({ buildings, selectedId, onSelect }: Props) {
  if (!buildings.length) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Upload a `.h2k` file — parsed buildings will appear here.
      </p>
    )
  }

  return (
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow>
          <TableHead>Address</TableHead>
          <TableHead>Wall RSI</TableHead>
          <TableHead>Win U</TableHead>
          <TableHead>ACH@50</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buildings.map((b) => (
          <TableRow
            key={b.id}
            data-state={selectedId === b.id ? 'selected' : undefined}
            className="cursor-pointer"
            onClick={() => onSelect(selectedId === b.id ? null : b.id)}
          >
            <TableCell className="max-w-[200px] truncate font-medium" title={b.address}>
              {b.address}
            </TableCell>
            <TableCell>{b.r_value.toFixed(3)}</TableCell>
            <TableCell>{b.u_value.toFixed(3)}</TableCell>
            <TableCell>{b.ach_value.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={b.is_compliant ? 'success' : 'destructive'}>
                {b.is_compliant ? 'Pass' : 'Fail'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
