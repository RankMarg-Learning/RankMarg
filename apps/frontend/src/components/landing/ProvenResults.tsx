import React from 'react'

const ProvenResults = () => {
    const stats = [
        { label: "Total Questions Solved", value: "50K+" },
        { label: "Avg. Score Improvement", value: "85%" },
        { label: "Rank Gains", value: "2000+" },
        { label: "Success Stories", value: "5000+" },
      ];
    
      return (
        <section className="bg-gradient-to-br from-primary-900 to-primary-800 text-white rounded-2xl px-8 py-12 md:py-16 shadow-lg max-w-7xl mx-auto my-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold mb-2">
              Proven Results That Matter
            </h2>
            <p className="text-neutral-400 text-base md:text-lg">
              Real data from thousands of NEET/JEE aspirants using Rankmarg
            </p>
          </div>
    
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-3xl md:text-4xl font-bold text-primary-200">{stat.value}</p>
                <p className="text-primary-50 mt-2 text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      );
}

export default ProvenResults