import { SubjectCardColor } from '@/constant/SubjectColorCode'
import { filterData } from '@/constant/topics'
import Link from 'next/link'
import React from 'react'

const SubjectList = ({ params }: { params: { subject: string } }) => {
    const { subject } = params
    const capitalizedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);

    const isValidSubject =
        Object.keys(filterData.JEE).includes(capitalizedSubject) ||
        Object.keys(filterData.NEET).includes(capitalizedSubject);

    if (!isValidSubject) {
        return <div>Invalid Subject</div>;
    }

    const topics = Array.from(new Set([
        ...(filterData.JEE[capitalizedSubject as keyof typeof filterData.JEE] || []),
        ...(filterData.NEET[capitalizedSubject as keyof typeof filterData.NEET] || [])
    ]));

    return (
        <div className="py-10 m-auto">
            <h1 className="text-lg  font-medium mb-6 mx-2">{capitalizedSubject} Topics</h1>
            <div className='grid md:grid-cols-3 gap-3 mx-2' >
                {topics.map((topic) => (
                    <Link href={`/questions/${subject}/${topic}`} key={topic} className="cursor-pointer">
                        <div
                            className={`
                                flex justify-between items-center border rounded-md p-2 transition-all duration-300
                                hover:ring-1 hover:ring-offset-1 
                                ${
                                  SubjectCardColor[subject as keyof typeof SubjectCardColor] || SubjectCardColor.default
                                }
                                ${
                                  subject === "physics"
                                    ? "hover:ring-purple-400"
                                    : subject === "chemistry"
                                    ? "hover:ring-amber-400"
                                    : subject === "mathematics"
                                    ? "hover:ring-blue-400"
                                    : subject === "biology"
                                    ? "hover:ring-green-400"
                                    : "hover:ring-gray-300"
                                }
                              `}
                                
                        >
                            <span className="text-sm ">{topic}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default SubjectList