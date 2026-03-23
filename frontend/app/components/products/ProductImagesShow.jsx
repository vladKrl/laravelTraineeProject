'use client'

import {useState} from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

export default function ProductImagesShow({images = []}) {
    const [errors, setErrors] = useState({});

    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide === images.length - 1 ? 0 : prevSlide + 1));
    };

    const handlePrevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide === 0 ? images.length - 1 : prevSlide - 1));
    };

    const formattedImages = images.map(image => ({
        id: image.id,
        url: image.path,
    }));

    return (
        <div className={"flex flex-col gap-4"}>
            <div className={"relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden group"}>
                <AiOutlineLeft
                    onClick={handlePrevSlide}
                    className="absolute left-2 top-1/2 m-auto text-5xl inset-y-1/2 cursor-pointer text-gray-400 z-20 rounded-full p-1 transition-all"
                    aria-label="Previous slide"
                />
                {images.map((image, index) => (
                    <div
                        key={image.id}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        {index === currentSlide && (
                            <img
                                src={image.path}
                                alt={"Nothing."}
                                className={"w-full h-full object-cover"}
                            />
                        )}
                </div>
                ))}
                <AiOutlineRight
                    onClick={handleNextSlide}
                    className="absolute right-2 top-1/2 m-auto text-5xl inset-y-1/2 cursor-pointer text-gray-400 z-20 rounded-full p-1 transition-all"
                    aria-label="Next slide"
                />
            </div>
            <div className="flex justify-center flex-wrap gap-2">
                {images.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-4 w-4 rounded-full cursor-pointer ${
                            index === currentSlide ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}