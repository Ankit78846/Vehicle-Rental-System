import HeroSection from '../components/HomePage/HeroSection.jsx';
import PopularDest from "../components/HomePage/Destination.jsx";
import VehicleBrowse from '../components/HomePage/Browse.jsx';
import ContactUs from '../components/HomePage/ContactUs.jsx';
import FAQPage from '../components/HomePage/FAQPage.jsx';
import { FaCarSide, FaRegHandshake, FaGift, FaBrain } from "react-icons/fa";
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="Home-page flex justify-center flex-col items-center">
      <HeroSection />
      <VehicleBrowse />
      <PopularDest />
      <FeatureSection/>
      <ContactUs/>
      <FAQPage />
    </div>
  );
}

export function FeatureSection() {
  const features = [
    {
      icon: <FaCarSide className="text-3xl text-red-600" />,
      title: "Exclusive web benefits",
      description: "Fast Track priority, Premium Cover, Pets Friendly Pack and much more!",
    },
    {
      icon: <FaRegHandshake className="text-3xl text-red-600" />,
      title: "Free cancellation",
      description: "Modify or cancel your booking free of charge with Premium or Standard rate",
    },
    {
      icon: <FaGift className="text-3xl text-red-600" />,
      title: "Upgraded fleet every year",
      description: "Take a break from routine with the latest vehicle models on the market",
    },
    {
      icon: <FaBrain className="text-3xl text-red-600" />,
      title: "Smart Recommendations",
      description: "AI-powered content filtering to find vehicles that match your preferences perfectly",
      isNew: true,
    },
  ];

  return (
    <section className=" my-10 px-10 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border-1 border-gray-200 shadow-sm p-6 text-center hover:shadow-md transition-shadow relative"
          >
            {feature.isNew && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </div>
            )}
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
            {feature.isNew && (
              <Link 
                to="/content-filtering-demo" 
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md text-xs hover:bg-blue-600 transition-colors"
              >
                Learn More
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}


export default Home;