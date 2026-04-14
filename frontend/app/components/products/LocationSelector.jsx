'use client'

import React, {useEffect, useState} from "react";
import api from "../../../utils/api";
import Label from "../Label";
import Select from "../../components/SelectDefault";
import Errors from "../Errors";

export default function LocationSelector ({ onLocationChange, initialRegionId = null, initialCityId = null, errors = {} }) {
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedRegion, setSelectedRegion] = useState(initialRegionId);
    const [selectedCity, setSelectedCity] = useState(initialCityId);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await api.get('/api/locations');

                setRegions(response.data.data.map(item => ({value: item.id, label: item.name})));
            } catch (error) {
                console.error(error);
            }
        }

        fetchRegions();
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await api.get(`/api/locations?parent_id=${selectedRegion}`);

                setCities(response.data.data.map(item => ({value: item.id, label: item.name})));
            } catch (error) {
                console.error(error);
            }
        }

        if (selectedRegion) {
            fetchCities();
        } else {
            setCities([]);
        }
    }, [selectedRegion]);

    const handleRegionChange = (option) => {
        const regionId = option ? option.value : null;

        setSelectedRegion(regionId);

        setSelectedCity(null);

        onLocationChange({ region_id: regionId, city_id: null });
    };

    const handleCityChange = (option) => {
        const cityId = option ? option.value : null;

        setSelectedCity(cityId);

        onLocationChange({ region_id: selectedRegion, city_id: cityId });
    }

    return (
        <div className={"space-y-4 border-l-4 border-indigo-400 pl-4 py-2 bg-white/50 rounded-r"}>
            <div>
                <Label htmlFor={"regions"}>Region</Label>
                <Select
                    id={"regions"}
                    name={"regions"}
                    instanceId={"regions"}
                    options={regions}
                    isMulti={false}
                    value={regions.find(region => region.value === selectedRegion)}
                    onChange={handleRegionChange}
                    placeholder="Choose region..."
                    noOptionsMessage={() => 'No regions found'}
                />
                {errors.region_id && (
                    <Errors errors={[errors.region_id[0]]} />
                )}
            </div>

            <div>
                <Label htmlFor={"cities"}>City / District</Label>
                <Select
                    id={"cities"}
                    name={"cities"}
                    instanceId={"cities"}
                    isMulti={false}
                    options={cities}
                    value={cities.find(city => city.value === selectedCity) || null}
                    onChange={handleCityChange}
                    placeholder={selectedRegion ? "Choose city/District..." : "Choose region first!"}
                    noOptionsMessage={() => 'No cities found'}
                    isDisabled={!selectedRegion}
                />
                {errors.city_id && (
                    <Errors errors={[errors.city_id[0]]} />
                )}
            </div>
        </div>
    )
}