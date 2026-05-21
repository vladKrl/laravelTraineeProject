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
    
    if (images.length === 0) {
        return (
            <div className={"w-full aspect-square bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 border-3 border-dashed border-gray-200"}>
                <svg className={"w-16 h-16 mb-2"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">No uploaded images</span>
            </div>
        );
    }

    return (
        <div className={"flex flex-col gap-4"}>
            <div className={"relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden group"}>
                {images.length > 1 &&
                    <AiOutlineLeft
                        onClick={handlePrevSlide}
                        className="absolute left-2 top-1/2 m-auto text-5xl inset-y-1/2 cursor-pointer text-gray-400 z-20 rounded-full p-1 transition-all"
                        aria-label="Previous slide"
                    />
                }
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
                {images.length > 1 &&
                    <AiOutlineRight
                        onClick={handleNextSlide}
                        className="absolute right-2 top-1/2 m-auto text-5xl inset-y-1/2 cursor-pointer text-gray-400 z-20 rounded-full p-1 transition-all"
                        aria-label="Next slide"
                    />
                }
            </div>
            {images.length > 1 &&
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
            }
        </div>
    );
}