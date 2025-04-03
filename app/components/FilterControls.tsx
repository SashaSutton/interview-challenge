"use client";
import { FC } from "react";
import styles from "./FilterControls.module.css";

type FilterControlsProps = {
    filterType: "lowpass" | "highpass";
    frequency: number;
    onFilterChange: (type: "lowpass" | "highpass", freq: number) => void;
};

export const FilterControls: FC<FilterControlsProps> = ({
                                                            filterType,
                                                            frequency,
                                                            onFilterChange,
                                                        }) => {
    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedType = event.target.value as "lowpass" | "highpass";
        onFilterChange(selectedType, frequency);
    };

    const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFrequency = parseFloat(event.target.value);
        onFilterChange(filterType, newFrequency);
    };

    return (
        <div className={styles.filterCard}>
            <h3 className={styles.filterTitle}>Audio Filter</h3>
            <div className={styles.filterRow}>
                <select
                    value={filterType}
                    onChange={handleTypeChange}
                    className={styles.filterSelect}
                >
                    <option value="lowpass">Low Pass</option>
                    <option value="highpass">High Pass</option>
                </select>
            </div>
            <div className={styles.filterRow}>
                <label className={styles.filterLabel}>
                    Frequency: {frequency.toFixed(0)} Hz
                    <input
                        type="range"
                        min="20"
                        max="20000"
                        step="1"
                        value={frequency}
                        onChange={handleFrequencyChange}
                        className={styles.filterSlider}
                    />
                </label>
            </div>
        </div>
    );
};