const fs = require('fs');
const path = require('path');

// Read the template data
const templateData = require('../data/loads.json');

// Helper function to get random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random number between min and max
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random value in euro range
const getRandomValue = (range) => {
    const min = parseInt(range[0].replace('€', '').replace(',', ''));
    const max = parseInt(range[1].replace('€', '').replace(',', ''));
    return `€${getRandomNumber(min, max).toLocaleString()}`;
};

// Helper function to calculate distance between coordinates
const calculateDistance = (from, to) => {
    const R = 6371; // Earth's radius in km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
};

// Generate 1000 loads
const generateLoads = () => {
    const loads = [];
    const cities = Object.entries(templateData.cities);
    const cargoTypes = Object.entries(templateData.cargo_types);
    const deliveryWindows = ["Same Day", "Next Day", "2-Day", "Express", "Standard"];
    
    for (let i = 1; i <= 1000; i++) {
        // Get random cities ensuring they're different
        const [fromCityName, fromCity] = getRandomItem(cities);
        let [toCityName, toCity] = getRandomItem(cities);
        while (toCityName === fromCityName) {
            [toCityName, toCity] = getRandomItem(cities);
        }

        // Get random cargo type and subtype
        const [cargoType, cargoDetails] = getRandomItem(cargoTypes);
        const cargoSubtype = getRandomItem(cargoDetails.subtypes);

        // Calculate actual distance
        const distance = calculateDistance(fromCity, toCity);

        // Determine if urgent based on distance and random chance
        const urgent = distance < 200 ? Math.random() < 0.4 : Math.random() < 0.2;

        // Generate load
        loads.push({
            id: `L${String(i).padStart(4, '0')}`,
            type: cargoType,
            cargo: cargoSubtype,
            weight: getRandomNumber(cargoDetails.typical_weights[0], cargoDetails.typical_weights[1]),
            from: fromCityName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            to: toCityName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            distance: distance,
            urgent: urgent,
            delivery_window: urgent ? getRandomItem(["Same Day", "Express"]) : getRandomItem(deliveryWindows),
            value: getRandomValue(cargoDetails.value_range),
            fromLocation: fromCity,
            toLocation: toCity
        });
    }

    return loads;
};

// Generate new data
const newData = {
    ...templateData,
    active_loads: generateLoads()
};

// Write to file
fs.writeFileSync(
    path.join(__dirname, '../data/generated_loads.json'),
    JSON.stringify(newData, null, 2)
);

console.log('Generated 1000 loads successfully!');
