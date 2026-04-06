import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-28 md:py-36 bg-gradient-to-b from-gray-50 to-white">
      <h1 className="animate-fade-in text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight max-w-2xl">
        Manage Your College Easily
      </h1>
      <p className="animate-fade-in text-lg md:text-xl text-gray-500 max-w-xl mb-10 leading-relaxed" style={{ animationDelay: '0.15s' }}>
        CollegePortal brings students, faculty, and administrators together in
        one place — streamlining courses, attendance, and academic management.
      </p>
      <button onClick={() => navigate('/register')} className="animate-fade-in px-8 py-3 text-white bg-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg" style={{ animationDelay: '0.3s' }}>
        Get Started
      </button>
    </section>
  );
};

export default Hero;
