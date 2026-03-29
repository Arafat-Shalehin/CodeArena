import { Card } from '@/components/ui/card'
import React from 'react'
import { languages } from '../data/languages.data'
import { getColor } from '../utils/getLanguageColor'
import { Dot } from 'lucide-react'

const Languages = () => {
    /**
     * Languages Component
     * * This component provides a visual breakdown of the programming languages
     * used by the user, highlighting proficiency and usage frequency.
     * * Key Features:
     * - Data Sorting: Implements a descending sort algorithm on 'languages' data
     * to prioritize the most used languages in the list.
     * - Multi-segment Progress Bar: A custom-built horizontal stacked bar
     * visualizing language distribution (Percentage-based).
     * - Dynamic Legend: Maps through the sorted dataset to display language names,
     * percentage values, and dynamic color-coded indicators (Dot icons).
     * - Utility Integration: Leverages a 'getColor' helper function for consistent
     * theming based on the language index.
     * * @returns {JSX.Element} A card-based language analytics section.
     */
    const biggerPercentage = [...languages].sort(
        (a, b) => b.improve_parcentage - a.improve_parcentage
    )
    return (
        <Card className="p-6">
            <h3 className="text-text-primary mb-4 text-xl font-semibold">Languages</h3>
            <div className="bg-bg-muted mb-4 flex h-2 w-full overflow-hidden rounded-full">
                <div className="bg-accent" style={{ width: '60%' }}></div>
                <div className="bg-warning" style={{ width: '25%' }}></div>
                <div className="bg-info" style={{ width: '15%' }}></div>
            </div>
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-5 text-xs font-medium">
                    {biggerPercentage.map((language, index) => (
                        <div key={index} className="flex justify-between">
                            <span className="text-text-secondary flex items-center text-left">
                                <Dot className={`${getColor(index)}`} size={30}></Dot>
                                {language.language}
                            </span>
                            <span className="text-text-muted text-left">
                                {language.improve_parcentage} %
                            </span>
                        </div>
                    ))}
                </div>
                {/* Add more as needed */}
            </div>
        </Card>
    )
}

export default Languages
