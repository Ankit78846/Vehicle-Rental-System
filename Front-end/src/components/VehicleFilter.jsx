// VehicleFilter Component - Advanced filtering for vehicles
import React, { useState, useEffect } from 'react';
import { FaFilter, FaChevronDown, FaTimes, FaSearch } from 'react-icons/fa';

const VehicleFilter = ({ vehicles, onFilterChange, onReset }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    type: '', // Single selection for radio button
    brands: [],
    fuelType: '', // Single selection for radio button
    transmission: '', // Single selection for radio button
    priceRange: { min: '', max: '' },
    capacityRange: { min: '', max: '' },
    locations: [],
    features: []
  });

  // Extract unique values from vehicles for filter options
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    brands: [],
    fuelTypes: [],
    transmissions: [],
    locations: [],
    features: [],
    priceRange: { min: 0, max: 0 },
    capacityRange: { min: 0, max: 0 }
  });

  // Initialize filter options when vehicles change
  useEffect(() => {
    console.log('VehicleFilter: vehicles changed', vehicles?.length);
    
    if (vehicles && vehicles.length > 0) {
      const types = [...new Set(vehicles.map(v => v.type))].sort();
      const brands = [...new Set(vehicles.map(v => v.brand))].sort();
      const fuelTypes = [...new Set(vehicles.map(v => v.fuelType))].sort();
      const transmissions = [...new Set(vehicles.map(v => v.transmission))].sort();
      const locations = [...new Set(vehicles.map(v => v.location))].sort();
      
      console.log('Filter options - Types:', types, 'Brands:', brands);
      
      // Extract all features from all vehicles
      const allFeatures = vehicles.reduce((acc, vehicle) => {
        if (vehicle.features) {
          Object.values(vehicle.features).forEach(featureList => {
            if (Array.isArray(featureList)) {
              featureList.forEach(feature => {
                if (feature && feature.trim()) acc.add(feature.trim());
              });
            }
          });
        }
        return acc;
      }, new Set());

      const prices = vehicles.map(v => {
        if (typeof v.price === 'number') return v.price;
        if (typeof v.price === 'string') {
          return parseFloat(v.price.replace(/[^\d.-]/g, '')) || 0;
        }
        return 0;
      });
      
      const capacities = vehicles.map(v => v.capacity || 0);

      const newFilterOptions = {
        types,
        brands,
        fuelTypes,
        transmissions,
        locations,
        features: [...allFeatures].sort(),
        priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
        capacityRange: { min: Math.min(...capacities), max: Math.max(...capacities) }
      };
      
      console.log('Setting filter options:', newFilterOptions);
      setFilterOptions(newFilterOptions);
    }
  }, [vehicles]);

  // Handle filter changes
  const handleFilterChange = (filterType, value, checked = null, isSingleSelect = false) => {
    console.log('Filter change:', { filterType, value, checked, isSingleSelect });
    
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (isSingleSelect) {
        // For single select (radio buttons), replace the entire value
        newFilters[filterType] = checked !== false ? value : '';
      } else {
        // For multi-select (checkboxes)
        if (!newFilters[filterType]) {
          newFilters[filterType] = [];
        }
        
        if (checked) {
          if (!newFilters[filterType].includes(value)) {
            newFilters[filterType] = [...newFilters[filterType], value];
          }
        } else {
          newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        }
      }
      
      console.log('New filters:', newFilters);
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleRangeChange = (filterType, rangeType, value) => {
    setActiveFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: {
          ...prev[filterType],
          [rangeType]: value
        }
      };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const resetFilters = () => {
    setActiveFilters({
      type: '',
      brands: [],
      fuelType: '',
      transmission: '',
      priceRange: { min: '', max: '' },
      capacityRange: { min: '', max: '' },
      locations: [],
      features: []
    });
    setSearchTerm('');
    onFilterChange({});
    if (onReset) onReset();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.type) count++;
    count += activeFilters.brands.length;
    if (activeFilters.fuelType) count++;
    if (activeFilters.transmission) count++;
    count += activeFilters.locations.length;
    count += activeFilters.features.length;
    if (activeFilters.priceRange.min || activeFilters.priceRange.max) count++;
    if (activeFilters.capacityRange.min || activeFilters.capacityRange.max) count++;
    if (searchTerm) count++;
    return count;
  };

  const FilterSection = ({ title, options, filterType, selectedValue, selectedValues, singleSelect = false }) => (
    <div className="mb-6">
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type={singleSelect ? "radio" : "checkbox"}
              name={singleSelect ? filterType : undefined}
              checked={singleSelect ? selectedValue === option : selectedValues?.includes(option)}
              onChange={(e) => {
                if (singleSelect) {
                  handleFilterChange(filterType, option, e.target.checked, true);
                } else {
                  handleFilterChange(filterType, option, e.target.checked);
                }
              }}
              className="text-red-600 focus:ring-red-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700 capitalize">
              {option === 'two-wheeler' ? 'Two Wheeler' : option}
            </span>
          </label>
        ))}
        {singleSelect && selectedValue && (
          <button
            onClick={() => handleFilterChange(filterType, '', false, true)}
            className="text-sm text-red-600 hover:text-red-800 underline mt-2"
          >
            Clear Selection
          </button>
        )}
      </div>
    </div>
  );

  const RangeFilter = ({ title, filterType, min, max, unit = '' }) => (
    <div className="mb-6">
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="flex space-x-2">
        <input
          type="number"
          placeholder={`Min ${unit}`}
          value={activeFilters[filterType]?.min || ''}
          onChange={(e) => handleRangeChange(filterType, 'min', e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          min={min}
          max={max}
        />
        <input
          type="number"
          placeholder={`Max ${unit}`}
          value={activeFilters[filterType]?.max || ''}
          onChange={(e) => handleRangeChange(filterType, 'max', e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          min={min}
          max={max}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Range: {min} - {max} {unit}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FaFilter className="text-gray-600" />
          <span className="text-gray-700 font-medium">Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
          <FaChevronDown className={`text-gray-600 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Search Input  */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Reset Button */}
        {getActiveFilterCount() > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FaTimes />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            <FilterSection
              title="Vehicle Type"
              options={filterOptions.types}
              filterType="type"
              selectedValue={activeFilters.type}
              singleSelect={true}
            />

            <FilterSection
              title="Brand"
              options={filterOptions.brands}
              filterType="brands"
              selectedValues={activeFilters.brands}
              singleSelect={false}
            />

            <FilterSection
              title="Fuel Type"
              options={filterOptions.fuelTypes}
              filterType="fuelType"
              selectedValue={activeFilters.fuelType}
              singleSelect={true}
            />

            <FilterSection
              title="Transmission"
              options={filterOptions.transmissions}
              filterType="transmission"
              selectedValue={activeFilters.transmission}
              singleSelect={true}
            />

            <FilterSection
              title="Location"
              options={filterOptions.locations}
              filterType="locations"
              selectedValues={activeFilters.locations}
              singleSelect={false}
            />

            <RangeFilter
              title="Price Range"
              filterType="priceRange"
              min={filterOptions.priceRange.min}
              max={filterOptions.priceRange.max}
              unit="रु"
            />

            <RangeFilter
              title="Capacity"
              filterType="capacityRange"
              min={filterOptions.capacityRange.min}
              max={filterOptions.capacityRange.max}
              unit="seats"
            />

            <FilterSection
              title="Features"
              options={filterOptions.features.slice(0, 20)} // Limit to top 20 features
              filterType="features"
              selectedValues={activeFilters.features}
              singleSelect={false}
            />

          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleFilter;
