import { features } from '../constants/landingData';

const Features = () => {
  return (
    <section className="px-6 md:px-12 py-20 bg-gray-50">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
        What We Offer
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="animate-fade-in p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:scale-105 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
