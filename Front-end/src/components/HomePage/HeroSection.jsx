import { useEffect, useState } from 'react';
import Jeep from '../../images/offroad.png';
import SUV from '../../images/jeep.png';
import Sedan from '../../images/suv.png';
import Offroad from '../../images/sedan.png';

const vehicles = [Jeep, SUV, Sedan, Offroad];
const texts = [
  'CHOOSE YOUR\nCOMFORTABLE VEHICLES',
  'RENT THE RIDE YOU DESERVE',
  'ENJOY LUXURY AND SAFETY',
];

function HeroSection() {
  const [vehicleIndex, setVehicleIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [vehicleSlide, setVehicleSlide] = useState(true);
  const [textSlide, setTextSlide] = useState(true);

  const handleContactUsClick = () => {
    const isHome = window.location.pathname === '/';

    if (isHome) {
      const ContactUsSection = document.getElementById('contactus-section');
      if (ContactUsSection) {
        ContactUsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }500};

    useEffect(() => {
      const vehicleTimer = setInterval(() => {
        setVehicleSlide(false); // trigger slide-out
        setTimeout(() => {
          setVehicleIndex((prev) => (prev + 1) % vehicles.length);
          setVehicleSlide(true); // trigger slide-in
        }, 300); // duration matches slide-out
      }, 4000);

      const textTimer = setInterval(() => {
        setTextSlide(false);
        setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % texts.length);
          setTextSlide(true);
        }, 300);
      }, 6000);

      return () => {
        clearInterval(vehicleTimer);
        clearInterval(textTimer);
      };
    }, []);

    return (
      <div className="flex flex-wrap-reverse items-center justify-center gap-[4vw] w-full px-6 py-12 pt-24 bg-[#f6f6f6] font-sans">
        {/* TEXT SECTION */}
        <div className="w-full md:max-w-[600px] flex justify-center items-center flex-col text-center overflow-hidden">
          <p className="text-[16px] md:text-[20px] text-[#333] mb-2">
            All discount just for you
          </p>
          <h1 className="text-red-600 text-[28px] md:text-[40px] font-bold my-1">
            Need A Ride?
          </h1>

          <div
            className={`transition-transform duration-500 ease-in-out ${textSlide ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-100'
              }`}
          >
            <h2 className="text-[24px] md:text-[36px] font-black text-[#111] my-2 whitespace-pre-line">
              {texts[textIndex]}
            </h2>
          </div>

          <p className="text-[16px] md:text-[22px] text-[#555] mb-4 md:mb-6">
            Best VEHICLE rental deals!!!!!
          </p>
          <button onClick={handleContactUsClick} className="bg-black text-white text-[16px] md:text-[20px] px-6 py-3 hover:bg-red-600 transition hover:scale-109">
            Contact Now
          </button>
        </div>

        {/* IMAGE SECTION */}
        <div className="w-full md:max-w-[500px] flex justify-center overflow-hidden">
          <img
            src={vehicles[vehicleIndex]}
            alt="Vehicle"
            className={`w-full h-auto max-h-[300px] md:max-h-[400px] object-contain transition-all duration-500 ease-in-out ${vehicleSlide ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            style={{ height: '400px' }}
          />
        </div>
      </div>
    );
  }

  export default HeroSection;
