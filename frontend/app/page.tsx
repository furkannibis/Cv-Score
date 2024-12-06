'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getScore } from './functions';
import '@/style/globals.css';

export default function Home() {
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [textIndex, setTextIndex] = useState<number>(0);

  const paragraphs = [
    "We are here to assist you in gaining valuable insights about the job you are interested in pursuing. Whether you are a seasoned professional or just starting your career journey, our platform is designed to bridge the gap between your skills and the job requirements.",
    "By analyzing the job description you provide and comparing it with your CV, we generate a compatibility score to help you understand how well you align with the position.",
    "This compatibility score is calculated using advanced algorithms that evaluate your skills, experiences, and qualifications against the specific requirements and expectations outlined in the job posting.",
    "It is an efficient and reliable way to identify your strengths, pinpoint areas for improvement, and prepare more effectively for your career goals.",
    "Remember, this tool is not just about numbers, it’s about empowering you with actionable insights to enhance your career journey."
  ];


  const getFeedback = (score: number | null) => {
    if (score === null) return '';
    if (score >= 80) {
      return "Great job! Your CV is highly compatible with the job description. Keep applying confidently!";
    } else if (score >= 50) {
      return "Good effort! Your CV aligns moderately with the job description. Consider tailoring it further for better results.";
    } else {
      return "You might need to work on your CV or skills to better match the job requirements. Keep improving and don't give up!";
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const text = paragraphs[textIndex];
      if (currentText.length < text.length) {
        setCurrentText((prev) => text.slice(0, prev.length + 1));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentText('');
          setTextIndex((prev) => (prev + 1) % paragraphs.length);
        }, 2000);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [currentText, textIndex, paragraphs]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = event.target as HTMLFormElement;
    const jobDescription = form.jobDescription.value;
    const cv = form.cv.files[0];

    try {
      const result = await getScore(jobDescription, cv);
      setScore(result);
    } catch (error) {
      console.error('Error while fetching score:', error);
      setError('An error occurred while calculating the score. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50 flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-700 dark:text-blue-400">CV Score</h1>
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-lg leading-relaxed font-medium">
          <span className="text-blue-600 dark:text-blue-300">{currentText}</span>
        </p>
      </div>

      <form className="max-w-md mx-auto mt-8" onSubmit={handleSubmit}>
        <div className="relative z-0 w-full mb-5 group">
          <textarea
            name="jobDescription"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Job Description
          </label>
        </div>
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="file"
            name="cv"
            accept=".pdf"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Your CV
          </label>
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Submit
        </button>
      </form>

      {isLoading && <p className="mt-4 text-blue-600 dark:text-blue-300">Loading...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {score !== null && !isLoading && (
        <div className="mt-4">
          <p className="text-green-600 text-lg text-center">Your CV score is: %{score}</p>
          <p className="text-gray-700 dark:text-gray-300 mt-2">{getFeedback(score)}</p>
        </div>
      )}
      <div className="mt-10 flex justify-center items-center gap-10">
        <Image
          src="/mert.jpeg"
          width={200}
          height={200}
          alt="Mert's profile picture"
          className="rounded-full"
        />
        <div className="flex flex-col items-center space-y-2">
          <p className="text-xl font-semibold text-blue-600">
            Kırşehir Ahi Evran Üniversitesi Bilgisayar Mühendisliği
          </p>
          <p className="text-3xl font-medium text-gray-800 dark:text-gray-200">
            Mert Kaan Beg - 202511051
          </p>
        </div>
      </div>
    </main>
  );
}
