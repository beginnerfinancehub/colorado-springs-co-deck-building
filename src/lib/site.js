// Central site facts. One place to change the phone number, service area,
// and business identity so every page and every schema block stays in sync.
// Per the quality bar (D6): no fabricated trust signals, no invented history.

export const SITE = {
  name: 'Colorado Springs Deck Building',
  domain: 'coloradospringsdeckbuilding.com',
  url: 'https://coloradospringsdeckbuilding.com',
  // Real provisioned Twilio number, swapped in at C4 (2026-09-13).
  phoneDisplay: '(719) 752-2254',
  phoneHref: 'tel:+17197522254',
  hours: '7am to 6pm, Mon to Fri, Sat by appointment',
  areaServed: ['Colorado Springs', 'Monument', 'Falcon', 'Fountain', 'Manitou Springs', 'Black Forest', 'Woodland Park'],
  // No street address: this is a lead-generation site, not a physical
  // storefront. Publishing a fabricated address would breach D6. City/state
  // only is honest and is the standard pattern for a service-area business.
  leadForm: {
    heading: 'Get your free deck quote',
    note: 'No obligation. We reply the same business day.',
    messageLabel: 'Tell us about the project',
    messagePlaceholder: 'Deck size, material you have in mind, and whether it is new construction or a repair/replacement.',
  },
  addressLocality: 'Colorado Springs',
  addressRegion: 'CO',
  addressCountry: 'US',
};

export function localBusinessSchema({ pageUrl, description, extraServices = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    name: SITE.name,
    url: pageUrl,
    telephone: SITE.phoneHref.replace('tel:', ''),
    description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.addressLocality,
      addressRegion: SITE.addressRegion,
      addressCountry: SITE.addressCountry,
    },
    areaServed: SITE.areaServed.map((city) => ({ '@type': 'City', name: `${city}, CO` })),
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '18:00',
    },
    ...(extraServices.length
      ? { makesOffer: extraServices.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s } })) }
      : {}),
  };
}

export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// Local addition, this site only (2026-09-13 pre-build SEO audit, item 7:
// "Service"/"BreadcrumbList" schema is a gap in the canonical lib/site.js
// every site inherits; flagged as portfolio-scope, addable per-site as a
// tracked local deviation without blocking this build). Added here rather
// than left as a silent gap; logged in this build's receipt as a candidate
// for a future network-wide lib/site.js pass, not promoted network-wide by
// this session (out of the C4 build-folder fence).
export function serviceSchema({ name, description, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    name,
    description,
    url,
    provider: { '@type': 'LocalBusiness', name: SITE.name },
    areaServed: SITE.areaServed.map((city) => ({ '@type': 'City', name: `${city}, CO` })),
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
