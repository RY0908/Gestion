import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils.js'
import { Skeleton } from '@/components/atoms/Skeleton.jsx'

export const DataTable = ({
    columns, data, isLoading, pagination, onPaginationChange,
    totalRows, sorting, onSortingChange, rowSelection, onRowSelectionChange,
    onRowClick, emptyMessage, toolbar, pageSize,
}) => {
    const [internalSorting, setInternalSorting] = useState([])
    const [internalRowSelection, setInternalRowSelection] = useState({})

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: Boolean(onPaginationChange),
        manualSorting: Boolean(onSortingChange),
        rowCount: totalRows,
        state: {
            sorting: sorting ?? internalSorting,
            rowSelection: rowSelection ?? internalRowSelection,
            pagination: pagination ?? { pageIndex: 0, pageSize: pageSize ?? 20 },
        },
        onSortingChange: onSortingChange ?? setInternalSorting,
        onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
        onPaginationChange: onPaginationChange,
    })

    return (
        <div className="flex flex-col gap-3">
            {toolbar && <div>{toolbar}</div>}

            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                        {table.getHeaderGroups().map(hg => (
                            <tr key={hg.id}>
                                {hg.headers.map(header => (
                                    <th
                                        key={header.id}
                                        scope="col"
                                        className="px-4 py-3.5 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={cn(
                                                    'flex items-center gap-1.5',
                                                    header.column.getCanSort() && 'cursor-pointer select-none hover:text-[var(--color-text)] transition-colors'
                                                )}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className="text-[var(--color-muted)]">
                                                        {header.column.getIsSorted() === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> :
                                                            header.column.getIsSorted() === 'desc' ? <ChevronDown className="w-3.5 h-3.5" /> :
                                                                <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: pageSize ?? 10 }).map((_, i) => (
                                <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/50 transition-colors">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <Skeleton className="h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-16 text-center text-[var(--color-muted)]">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="h-12 w-12 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
                                            <svg className="w-6 h-6 text-[var(--color-muted)]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <span>{emptyMessage ?? 'Aucune donnée disponible'}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick?.(row.original)}
                                    className={cn(
                                        'border-b border-[var(--color-border)] last:border-0 transition-all duration-200 ease-out',
                                        onRowClick && 'cursor-pointer hover:bg-[var(--color-bg)] hover:shadow-sm hover:z-10 relative z-0',
                                        row.getIsSelected() && 'bg-sonatrach-green/5'
                                    )}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-3.5 whitespace-nowrap text-[var(--color-text)]">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            {!isLoading && table.getRowModel().rows.length > 0 && (
                <div className="flex items-center justify-between text-sm mt-1 px-1">
                    <span className="text-[var(--color-muted)]">
                        {totalRows ?? data?.length ?? 0} résultat{(totalRows ?? data?.length ?? 0) !== 1 ? 's' : ''} au total
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="text-[var(--color-muted)] text-xs font-medium">
                            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount() || 1}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="px-3 py-1.5 border border-[var(--color-border)] rounded shadow-sm text-xs font-medium hover:bg-[var(--color-bg)] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="px-3 py-1.5 border border-[var(--color-border)] rounded shadow-sm text-xs font-medium hover:bg-[var(--color-bg)] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

DataTable.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array,
    isLoading: PropTypes.bool,
    pagination: PropTypes.shape({ pageIndex: PropTypes.number, pageSize: PropTypes.number }),
    onPaginationChange: PropTypes.func,
    totalRows: PropTypes.number,
    sorting: PropTypes.array,
    onSortingChange: PropTypes.func,
    rowSelection: PropTypes.object,
    onRowSelectionChange: PropTypes.func,
    onRowClick: PropTypes.func,
    emptyMessage: PropTypes.string,
    toolbar: PropTypes.node,
    pageSize: PropTypes.number,
}
