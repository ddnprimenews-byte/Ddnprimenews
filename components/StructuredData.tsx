import React from 'react';

export const OrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'डीडीएन प्राइम न्यूज़ (DDN Prime News)',
    url: 'https://ddnprimenews.com',
    logo: 'https://ddnprimenews.com/icon.png',
    slogan: 'सच्ची निष्पक्ष निर्भय निर्भिक पत्रकारिता',
    sameAs: [
      'https://facebook.com',
      'https://youtube.com',
      'https://twitter.com'
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const WebsiteSearchSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://ddnprimenews.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://ddnprimenews.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
