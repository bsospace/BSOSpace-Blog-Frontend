import React, { createContext, useContext, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
}

const defaultSEO: SEOProps = {
    title: 'BSOSPACE Blog',
    description: 'BSOSPACE Blog' ,
    image: '/favicon.ico',
    url: 'https://blog.bsospace.com',
};

const SEOContext = createContext<SEOProps>(defaultSEO);

export const SEOProvider = ({ children, value }: { children: ReactNode; value?: SEOProps }) => {
    const seo = { ...defaultSEO, ...value };

    return (
        <SEOContext.Provider value={seo}>
            <Helmet>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                <meta property="og:title" content={seo.title} />
                <meta property="og:description" content={seo.description} />
                <meta property="og:image" content={seo.image} />
                <meta property="og:url" content={seo.url} />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>
            {children}
        </SEOContext.Provider>
    );
};

export const useSEO = () => useContext(SEOContext);