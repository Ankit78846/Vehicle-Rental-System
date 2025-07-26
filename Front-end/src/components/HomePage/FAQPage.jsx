import React, { useState, useEffect, useRef } from 'react';

const faqs = [
  {
    question: "How do I rent a vehicle?",
    answer:
      "Renting a vehicle is simple and straightforward. Browse our extensive fleet of available vehicles, use filters to find your perfect match, select your preferred vehicle, choose your pickup and drop-off dates, provide required documentation, and complete your booking online with secure payment. You'll receive instant confirmation and detailed pickup instructions.",
  },
  {
    question: "What documents do I need to provide?",
    answer:
      "You'll need: (1) A valid driving license issued by the government, (2) Government-issued photo ID (citizenship certificate, passport, or national ID), (3) Proof of address (utility bill or bank statement), (4) Valid credit/debit card for payment and security deposit. International visitors may need an International Driving Permit (IDP) along with their home country license.",
  },
  {
    question: "Can I cancel or modify my booking?",
    answer:
      "Yes, we offer flexible cancellation and modification policies. Free cancellation up to 24 hours before pickup for Standard bookings, free cancellation up to 2 hours before pickup for Premium bookings. Modifications to dates, times, or vehicle type can be made subject to availability. Cancellation fees may apply for last-minute changes.",
  },
  {
    question: "Is fuel included in the rental price?",
    answer:
      "Fuel is not included in the rental price. Vehicles are provided with a full tank of fuel, and you're responsible for returning the vehicle with the same fuel level. If returned with less fuel, a refueling charge will apply. We recommend taking a photo of the fuel gauge at pickup and drop-off for reference.",
  },
  {
    question: "Do you offer roadside assistance?",
    answer:
      "Yes! We provide 24/7 roadside assistance for all our rentals. This includes emergency breakdown service, flat tire assistance, battery jump-start, lockout service, and emergency towing if needed. Premium customers get priority response times and additional coverage for mechanical issues.",
  },
  {
    question: "Can I rent out my own vehicle?",
    answer:
      "Absolutely! Join our host community and earn passive income by listing your vehicle. We handle insurance, customer support, and payments. You set your availability and pricing. Requirements include: vehicle registration, comprehensive insurance, safety inspection, and clean driving record. Earn up to रु 25,000+ per month depending on your vehicle type and availability.",
  },
];

function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const faqContainerRef = useRef(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Close FAQ when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (faqContainerRef.current && !faqContainerRef.current.contains(event.target)) {
        setOpenIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="w-full md:w-full lg:w-[95vw] xl:w-[85vw] mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
        <section id="faq-section" className="py-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our vehicle rental service. 
              Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          {/* FAQ Items */}
          <div ref={faqContainerRef} className="space-y-6 max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <button
                  className="w-full text-left px-6 sm:px-8 py-6 flex justify-between items-center focus:outline-none group"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4 group-hover:text-blue-600 transition-colors duration-200">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0 text-blue-600">
                    <svg
                      className={`w-6 h-6 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>
                
                {/* Animated dropdown content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 sm:px-8 pb-6 border-t border-gray-50">
                    <p className="text-gray-700 leading-relaxed pt-4 text-sm sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
    
        </section>
      </div>
    </>
  );
}

export default FAQPage;
