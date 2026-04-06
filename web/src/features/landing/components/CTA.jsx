const CTA = () => {
  return (
    <section className="px-6 py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-blue-600 rounded-2xl px-8 py-16 text-center shadow-lg">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
          Start Managing Your College Today
        </h2>
        <p className="text-blue-100 text-lg mb-10 leading-relaxed">
          Join thousands of institutions already using CollegePortal to simplify
          administration, boost engagement, and empower every stakeholder.
        </p>
        <button className="px-8 py-3 bg-white text-blue-600 font-semibold text-lg rounded-xl hover:bg-blue-50 hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default CTA;
