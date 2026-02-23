import React from 'react';
import StatusIcon from './StatusIcon';
import PaginationBtn from './PaginationBtn';
import { difficultyConfig } from '../data/problems.data';

export default function ProblemsTable({ problems }) {
    return (
        <div className="w-full border border-border rounded-lg overflow-hidden bg-bg-page shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-bg-subtle border-b border-border">
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-14">Status</th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-16 hidden sm:table-cell">ID</th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Title</th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-28 text-center">Difficulty</th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-36 hidden md:table-cell">Acceptance</th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-28 hidden lg:table-cell">Submissions</th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide hidden lg:table-cell">Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems.map((p) => {
                            const diff = difficultyConfig[p.difficulty];
                            return (
                                <tr
                                    key={p.id}
                                    className="border-t border-border hover:bg-bg-subtle transition-colors duration-fast cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <StatusIcon status={p.status} />
                                    </td>
                                    <td className="px-6 py-4 font-mono text-text-muted text-xs hidden sm:table-cell">{p.id}</td>
                                    <td className="px-6 py-4">
                                        <a href="#" className="font-medium text-text-primary group-hover:text-accent transition-colors text-sm">
                                            {p.title}
                                        </a>
                                        {/* Show tags inline on small screens */}
                                        <div className="flex flex-wrap gap-1.5 mt-1.5 lg:hidden">
                                            {p.tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium bg-bg-muted text-text-secondary uppercase tracking-wide">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${diff.badge}`}>
                                            {p.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="w-full bg-bg-muted rounded-full h-1.5 mb-1 bg-opacity-50 relative overflow-hidden">
                                            <div
                                                className={`absolute top-0 left-0 h-full ${diff.progress}`}
                                                style={{ width: `${p.acceptance}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-text-muted font-mono">{p.acceptance}%</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-text-muted text-xs hidden lg:table-cell">{p.submissions}</td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1.5">
                                            {p.tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium bg-bg-muted text-text-secondary uppercase tracking-wide">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {problems.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center text-text-muted">
                                    <div className="flex flex-col items-center gap-3">
                                        <svg className="w-10 h-10 text-text-muted opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                        </svg>
                                        <p className="font-medium text-text-primary">No problems found</p>
                                        <p className="text-sm">Try adjusting your search or filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-bg-subtle border-t border-border">
                <p className="text-text-secondary text-sm">Showing 1 to {Math.min(50, problems.length || 0)} of 2,542 problems</p>
                <nav className="flex items-center gap-1">
                    <PaginationBtn disabled>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </PaginationBtn>
                    {[1, 2, 3].map(n => (
                        <PaginationBtn key={n} active={n === 1}>{n}</PaginationBtn>
                    ))}
                    <span className="px-2 text-text-muted text-sm">...</span>
                    <PaginationBtn>10</PaginationBtn>
                    <PaginationBtn>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </PaginationBtn>
                </nav>
            </div>
        </div>
    );
}
