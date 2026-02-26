/**
 * @file SubmissionTable.jsx
 * @description Recent submissions table using shadcn/ui components.
 */

import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

/**
 * @component SubmissionTable
 * @description Renders a table of recent coding submissions.
 *
 * @param {Object} props - Component props
 * @param {Array<import('../data/dashboard.data').Submission>} props.submissions - Array of submission objects
 * @returns {JSX.Element} The rendered SubmissionTable component.
 */
const SubmissionTable = ({ submissions }) => (
    <div className="bg-bg-subtle border-border overflow-hidden rounded-xl border shadow-sm">
        <div className="border-border flex items-center justify-between border-b p-6">
            <h3 className="text-text-primary text-lg font-bold">Recent Submissions</h3>
            <button className="text-accent text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-bg-muted/30">
                    <TableRow>
                        <TableHead className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                            Time
                        </TableHead>
                        <TableHead className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                            Problem
                        </TableHead>
                        <TableHead className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                            Language
                        </TableHead>
                        <TableHead className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                            Verdict
                        </TableHead>
                        <TableHead className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                            Score
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {submissions.map((sub, i) => (
                        <TableRow key={i} className="hover:bg-accent/5 group transition-colors">
                            <TableCell className="text-text-muted text-xs">{sub.time}</TableCell>
                            <TableCell className="text-text-primary group-hover:text-accent text-sm font-bold">
                                {sub.problem}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className="bg-accent/10 text-accent font-bold"
                                >
                                    {sub.lang}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-bold ${sub.bg} ${sub.color}`}
                                >
                                    {sub.verdict}
                                </span>
                            </TableCell>
                            <TableCell className="text-text-primary text-sm font-bold">
                                {sub.score}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
)

export default SubmissionTable
