import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, InfoIcon, AlertTriangleIcon, Sprout, HelpCircle, Leaf, ChevronDown } from 'lucide-react';
import FallingLeaves from './components/ui/FallingLeaves';
import './App.css';

const animationCSS = `
  @keyframes float {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(15px, -15px) rotate(5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }

  @keyframes float-reverse {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-15px, -10px) rotate(-5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.1); opacity: 0.2; }
    100% { transform: scale(1); opacity: 0.4; }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }

  .floating-leaf-1, .floating-leaf-2, .floating-leaf-3, .floating-leaf-4 {
    position: absolute;
    color: #22c55e;
    opacity: 0.2;
    z-index: 0;
    display: none;
  }

  @media (min-width: 768px) {
    .floating-leaf-1, .floating-leaf-2, .floating-leaf-3, .floating-leaf-4 {
      display: block;
    }
  }

  .floating-leaf-1 {
    top: 10%;
    left: 10%;
    font-size: 2rem;
    animation: float 8s ease-in-out infinite;
  }

  .floating-leaf-2 {
    top: 70%;
    left: 15%;
    font-size: 3rem;
    animation: float-reverse 9s ease-in-out infinite;
  }

  .floating-leaf-3 {
    top: 20%;
    right: 10%;
    font-size: 2.5rem;
    animation: float 10s ease-in-out infinite;
  }

  .floating-leaf-4 {
    bottom: 15%;
    right: 15%;
    font-size: 3.5rem;
    animation: float-reverse 12s ease-in-out infinite;
  }

  .light-pulse {
    position: absolute;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    z-index: 0;
    animation: pulse 8s ease-in-out infinite;
  }

  .light-pulse-1 {
    top: -10%;
    left: -10%;
    width: 40vw;
    height: 40vw;
    animation-delay: 0s;
  }

  .light-pulse-2 {
    bottom: -20%;
    right: -10%;
    width: 50vw;
    height: 50vw;
    animation-delay: 2s;
  }

  .light-pulse-3 {
    top: 40%;
    right: 20%;
    width: 30vw;
    height: 30vw;
    animation-delay: 4s;
  }

  @media (max-width: 640px) {
    .tab-button {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  }
  
  .scroll-indicator {
    animation: bounce 2s infinite;
  }
`;

const formSchema = z.object({
  nitrogen: z.string().refine(val => !isNaN(val) && parseFloat(val) >= 0, {
    message: "Must be a positive number",
  }),
  phosphorus: z.string().refine(val => !isNaN(val) && parseFloat(val) >= 0),
  potassium: z.string().refine(val => !isNaN(val) && parseFloat(val) >= 0),
  temperature: z.string().refine(val => !isNaN(val) && parseFloat(val) >= -50 && parseFloat(val) <= 60),
  humidity: z.string().refine(val => !isNaN(val) && parseFloat(val) >= 0 && parseFloat(val) <= 100),
  ph: z.string().refine(val => !isNaN(val) && parseFloat(val) >= 0 && parseFloat(val) <= 14),
  rainfall: z.string().refine(val => !isNaN(val) && parseFloat(val) >= 0),
});

const fields = [
  { name: 'nitrogen', label: 'Nitrogen (N)', placeholder: '0-140' },
  { name: 'phosphorus', label: 'Phosphorus (P)', placeholder: '5-145' },
  { name: 'potassium', label: 'Potassium (K)', placeholder: '5-205' },
  { name: 'temperature', label: 'Temperature (°C)', placeholder: '8.8-43.7' },
  { name: 'humidity', label: 'Humidity (%)', placeholder: '14.6-99.9' },
  { name: 'ph', label: 'pH', placeholder: '3.5-9.9' },
  { name: 'rainfall', label: 'Rainfall (mm)', placeholder: '20.2-298.6' }
];

const educationalContent = [
  {
    icon: <InfoIcon className="h-6 w-6 md:h-8 md:w-8 text-green-600 mb-2" />,
    title: "Crop Selection Impact",
    content: "Proper crop selection can increase yield by up to 30% and reduce resource usage by 20%, directly affecting farmer income and sustainability."
  },
  {
    icon: <AlertTriangleIcon className="h-6 w-6 md:h-8 md:w-8 text-amber-500 mb-2" />,
    title: "Failed Harvest Risks",
    content: "Crop failure can lead to an average 60% income loss for small-scale farmers, pushing many into debt cycles and food insecurity for their families."
  },
  {
    icon: <Sprout className="h-6 w-6 md:h-8 md:w-8 text-green-700 mb-2" />,
    title: "Optimal Growth",
    content: "Crops grown in optimal soil and climate conditions require 40% less water, 30% less fertilizer, and are more resistant to pests and diseases."
  }
];

const CropRecommendationForm = () => {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); 
  const [mounted, setMounted] = useState(false);

  
  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      temperature: '',
      humidity: '',
      ph: '',
      rainfall: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('https://cropcast-2.onrender.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Prediction failed');

      const result = await response.json();
      setPrediction(result.predicted_crop);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const SidePanel = () => (
    <div className="space-y-6">
      {/* How to Use Panel */}
      <Card className="border-0 bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6">
          <div className="flex items-center">
            <HelpCircle className="h-5 w-5 md:h-6 md:w-6 text-white mr-2" />
            <CardTitle className="text-xl md:text-2xl font-bold text-white">
              How to Use
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="text-center">
            <ol className="text-left text-gray-700 space-y-3 md:space-y-4 text-sm md:text-base">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 flex-shrink-0 text-xs md:text-sm">1</span>
                <span>Enter your soil test results (N, P, K values)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 flex-shrink-0 text-xs md:text-sm">2</span>
                <span>Add local climate data (temperature, humidity, rainfall)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 flex-shrink-0 text-xs md:text-sm">3</span>
                <span>Include soil pH level</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 flex-shrink-0 text-xs md:text-sm">4</span>
                <span>Get personalized crop recommendations for optimal yields</span>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Educational Panel */}
      <Card className="border-0 bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 md:p-6">
          <div className="flex items-center">
            <InfoIcon className="h-5 w-5 md:h-6 md:w-6 text-white mr-2" />
            <CardTitle className="text-xl md:text-2xl font-bold text-white">
              Why Crop Selection Matters
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-3 md:space-y-4">
            <div className="bg-amber-50 p-3 md:p-4 rounded-lg transition-all duration-300 hover:shadow-md">
              <h3 className="text-base md:text-lg font-medium text-amber-800 mb-1 md:mb-2">Financial Security</h3>
              <p className="text-gray-700 text-xs md:text-sm">
                Proper crop selection can increase annual income by 25-45% for small-scale farmers, providing financial stability for families and communities.
              </p>
            </div>

            <div className="bg-red-50 p-3 md:p-4 rounded-lg transition-all duration-300 hover:shadow-md">
              <h3 className="text-base md:text-lg font-medium text-red-800 mb-1 md:mb-2">Risk of Poor Selection</h3>
              <p className="text-gray-700 text-xs md:text-sm">
                Choosing inappropriate crops leads to 40-60% lower yields, wasted resources, and potential total crop failure in adverse conditions.
              </p>
            </div>

            <div className="bg-green-50 p-3 md:p-4 rounded-lg transition-all duration-300 hover:shadow-md">
              <h3 className="text-base md:text-lg font-medium text-green-800 mb-1 md:mb-2">Sustainability Impact</h3>
              <p className="text-gray-700 text-xs md:text-sm">
                Optimized crop selection reduces water usage by up to 30% and fertilizer needs by 25%, promoting sustainable farming practices.
              </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200 transition-all duration-300 hover:shadow-md">
              <AlertTitle className="text-blue-800 text-base md:text-lg">Farmer Success Story</AlertTitle>
              <AlertDescription className="text-gray-700 text-xs md:text-sm">
                "After using data-driven crop recommendations, my yield increased by 35% and water usage decreased by 20% in just one growing season."
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <style>{animationCSS}</style>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-start p-2 md:p-4 overflow-hidden relative">
        {/* Background Animation Elements */}
        <div className="floating-leaf-1"><Leaf /></div>
        <div className="floating-leaf-2"><Leaf /></div>
        <div className="floating-leaf-3"><Leaf /></div>
        <div className="floating-leaf-4"><Leaf /></div>
        <div className="light-pulse light-pulse-1"></div>
        <div className="light-pulse light-pulse-2"></div>
        <div className="light-pulse light-pulse-3"></div>
        <FallingLeaves />

        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 md:gap-6 relative z-10">
          {/* Main Form Card */}
          <Card className={`flex-1 border-0 bg-white shadow-lg rounded-xl overflow-hidden bg-[url('/api/placeholder/1200/400')] bg-cover bg-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-gradient-to-r from-green-800/90 to-green-900/90 backdrop-blur-sm">
              <CardHeader className="p-4 md:p-8">
                <div className="flex items-center justify-center mb-2 md:mb-4">
                  <Sprout className="h-8 w-8 md:h-12 md:w-12 text-green-300 mr-2 md:mr-4" />
                  <CardTitle className="text-2xl md:text-4xl font-bold text-white text-center">
                    Crop Recommendation
                  </CardTitle>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mt-2 md:mt-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-1 flex">
                    <button
                      onClick={() => setActiveTab('form')}
                      className={`px-3 py-1 md:px-6 md:py-2 rounded-full font-medium transition-all text-sm md:text-base tab-button ${activeTab === 'form'
                          ? 'bg-white text-green-700'
                          : 'text-white hover:bg-white hover:bg-opacity-10'
                        }`}
                    >
                      Input Data
                    </button>
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`px-3 py-1 md:px-6 md:py-2 rounded-full font-medium transition-all text-sm md:text-base tab-button ${activeTab === 'info'
                          ? 'bg-white text-green-700'
                          : 'text-white hover:bg-white hover:bg-opacity-10'
                        }`}
                    >
                      Why It Matters
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-8 bg-white">
                {activeTab === 'form' ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {fields.map((field, index) => (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name}
                            render={({ field: formField }) => (
                              <FormItem
                                className={`bg-gradient-to-br from-white to-green-50 p-3 md:p-4 rounded-lg shadow-md border border-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                              >
                                <FormLabel className="text-green-700 text-base md:text-lg font-medium">
                                  {field.label}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={field.placeholder}
                                    className="mt-1 md:mt-2 focus:ring-green-500 focus:border-green-500 text-base md:text-lg bg-white"
                                    {...formField}
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs md:text-sm" />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>

                      <div className="flex justify-center mt-4 md:mt-8">
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 md:py-6 px-6 md:px-12 text-base md:text-xl rounded-lg w-full md:w-auto transition-all hover:shadow-xl hover:scale-105 shadow-md"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 md:h-6 md:w-6 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            'Get Recommendation'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4 md:space-y-8">
                    {educationalContent.map((item, index) => (
                      <div
                        key={index}
                        className={`bg-gradient-to-r from-green-50 to-blue-50 p-3 md:p-6 rounded-xl border border-green-100 shadow-md hover:shadow-lg transition-all duration-500 transform ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            {item.icon}
                          </div>
                          <div className="ml-3 md:ml-4">
                            <h3 className="text-lg md:text-xl font-semibold text-green-800 mb-1 md:mb-2">{item.title}</h3>
                            <p className="text-gray-700 text-sm md:text-base">{item.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div
                      className={`bg-amber-50 p-3 md:p-6 rounded-xl border border-amber-100 shadow-md hover:shadow-lg transition-all duration-500 transform ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                      style={{ transitionDelay: '450ms' }}
                    >
                      <h3 className="text-lg md:text-xl font-semibold text-amber-800 mb-1 md:mb-2">Did You Know?</h3>
                      <p className="text-gray-700 text-sm md:text-base">
                        Planting inappropriate crops can lead to up to 70% more water usage and a significant increase in fertilizer costs, while dramatically reducing yield and income potential.
                      </p>
                    </div>
                  </div>
                )}

                {(prediction || error) && (
                  <div className={`mt-4 md:mt-8 transition-all duration-500 ${prediction || error ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {prediction && (
                      <Alert className="bg-gradient-to-r from-green-100 to-green-200 border border-green-400 shadow-lg rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 md:gap-4 p-2">
                          <div className="bg-green-600 p-2 md:p-3 rounded-full flex-shrink-0">
                            <Sprout className="h-6 w-6 md:h-8 md:w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <AlertTitle className="text-green-800 text-base md:text-lg font-semibold">
                              Recommended Crop
                            </AlertTitle>
                            <AlertDescription>
                              <div className="text-green-700 text-xl md:text-3xl font-bold mt-1">
                                {prediction}
                              </div>
                              <p className="text-green-600 mt-1 text-xs md:text-sm">
                                This crop is optimized for your soil and climate conditions.
                              </p>
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    )}

                    {error && (
                      <Alert className="bg-red-100 border border-red-400 shadow-md rounded-xl">
                        <AlertTitle className="text-red-800 text-base md:text-lg">Error</AlertTitle>
                        <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </div>
          </Card>

          {/* Side Panel - Desktop only */}
          <div className="lg:w-96 space-y-6 hidden lg:block">
            <SidePanel />
          </div>
        </div>

        {/* Mobile scroll indicator - only shown on smaller screens */}
        <div className="lg:hidden flex flex-col items-center mt-8 mb-6 w-full">
          <Button
            onClick={scrollToBottom}
            className="bg-green-100 hover:bg-green-200 text-green-800 rounded-full px-4 py-2 shadow-md flex items-center gap-2"
          >
            <span>Scroll for more information</span>
            <ChevronDown className="h-5 w-5 scroll-indicator" />
          </Button>
        </div>

        {/* Mobile info panels - stacked at the bottom */}
        <div className={`w-full max-w-6xl lg:hidden mt-2 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-xl font-bold text-green-800 text-center mb-4">Additional Information</h2>
          <SidePanel />
        </div>
      </div>
    </>
  );
};

export default CropRecommendationForm;
