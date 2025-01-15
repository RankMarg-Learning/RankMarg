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
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 mx-2">{capitalizedSubject} Topics</h1>
            <div className='grid md:grid-cols-3 gap-3 mx-2' >
                {topics.map((topic) => (
                    <Link href={`/questions/${subject}/${topic}`} key={topic} className="cursor-pointer ">
                        <div className="flex justify-between items-center border border-gray-300 rounded-md p-4 hover:bg-yellow-100 transition">
                            <span className="text-sm sm:text-base">{topic}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default SubjectList