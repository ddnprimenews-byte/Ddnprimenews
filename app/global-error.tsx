'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="hi">
      <body style={{ margin: 0, padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f4', color: '#1c1917', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: '1px solid #e7e5e4' }}>
          <div style={{ backgroundColor: '#800000', color: '#ffffff', padding: '24px', textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              तकनीकी समस्या (Temporary Issue)
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#fca5a5' }}>
              दरभंगा डिजिटल नेटवर्क (DDN Prime News)
            </p>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '16px', fontSize: '13px', color: '#78350f', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>पृष्ठ लोड करते समय अप्रत्याशित समस्या हुई।</p>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#57534e' }}>
                कृपया नीचे दिए गए बटन पर क्लिक करके पोर्टल को पुनः लोड करें।
              </p>
              {error?.message && (
                <p style={{ marginTop: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#991b1b', wordBreak: 'break-word' }}>
                  {error.message}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    try {
                      localStorage.clear();
                      sessionStorage.clear();
                    } catch (e) {}
                    window.location.href = '/';
                  }
                }}
                style={{ flex: 1, padding: '10px', backgroundColor: '#b91c1c', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                डेटा साफ़ कर पुनः लोड करें
              </button>
              <button
                type="button"
                onClick={() => reset()}
                style={{ flex: 1, padding: '10px', backgroundColor: '#e7e5e4', color: '#1c1917', border: '1px solid #d6d3d1', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                पुनः प्रयास करें
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
