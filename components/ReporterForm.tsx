'use client';

import { useState, FormEvent } from 'react';

export default function ReporterForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/reporter', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('आपका फॉर्म सफलतापूर्वक जमा हो गया है!');
        form.reset();
      } else {
        setMessage('फॉर्म जमा करने में विफल, कृपया पुनः प्रयास करें।');
      }
    } catch (error) {
      setMessage('नेटवर्क समस्या! कृपया अपना कनेक्शन जांचें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800">रिपोर्टर आवेदन फॉर्म</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">पूरा नाम</label>
        <input 
          type="text" 
          name="name" 
          required 
          className="mt-1 w-full p-2 border border-gray-300 rounded-md"
          placeholder="अपना नाम दर्ज करें"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">ईमेल आईडी</label>
        <input 
          type="email" 
          name="email" 
          required 
          className="mt-1 w-full p-2 border border-gray-300 rounded-md"
          placeholder="example@gmail.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">संदेश / विवरण</label>
        <textarea 
          name="message" 
          rows={4} 
          required 
          className="mt-1 w-full p-2 border border-gray-300 rounded-md"
          placeholder="अपनी जानकारी यहाँ लिखें..."
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400 cursor-pointer transition"
      >
        {loading ? 'जमा हो रहा है...' : 'आवेदन जमा करें'}
      </button>

      {message && (
        <p className={`text-sm mt-2 text-center font-medium ${message.includes('सफलतापूर्वक') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
